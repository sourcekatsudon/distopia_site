import * as THREE from '../../vendor/three.module.js';

/**
 * ARC-RG7 / BLUE REQUIEM - lightweight WebGL energy-systems overlay.
 *
 * Independent of the existing weapon gameplay state. Mount this AFTER the
 * static weapon batching pass in weapon.js, and forward its state to update().
 * Uses two merged slit meshes, one instanced limiter mesh, one buffered arc
 * mesh and a small number of shared reactor meshes. All GPU resources are
 * created once and disposed explicitly.
 *
 * Coordinate convention inherited from createRailgun(): -Z is the muzzle.
 */
const EMPTY_STATE=Object.freeze({});
const number=(value,fallback)=>Number.isFinite(value)?value:fallback;

export function createRailgunEnergyFX({rig, receiver, rails, quality = 'high'} = {}) {
  if (!rig?.isObject3D || !receiver?.isObject3D || !rails?.isObject3D) {
    throw new TypeError('createRailgunEnergyFX requires rig, receiver and rails groups');
  }

  const high = quality !== 'low';
  const ownedGeometry = [];
  const ownedMaterial = [];
  const ownedTexture = [];
  const mounts = [];
  const ownGeo = g => (ownedGeometry.push(g), g);
  const ownMat = m => (ownedMaterial.push(m), m);
  const mount = (node, parent) => {parent.add(node); mounts.push(node); return node;};
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  let dead = false;
  let shotBoost = 0;
  let lastPower = 1;
  let lastCharge=0,lastEnergy=1,lastReload=false,lastMotionTime=0;
  const instanced=[];

  // Two draw calls for ALL body slits. Each rectangle has its own phase, and
  // an along-the-slit UV coordinate; the fragment shader makes light travel.
  const uniforms = {
    time: {value: 0},
    charge: {value: 0},
    shot: {value: 0},
    energy: {value: 1},
  };
  const slitMat = ownMat(new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    vertexShader: `
      attribute float phase;
      varying vec2 vUvFlow;
      varying float vPhase;
      void main() {
        vUvFlow = uv;
        vPhase = phase;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUvFlow;
      varying float vPhase;
      uniform float time, charge, shot, energy;
      void main() {
        float edge = smoothstep(0.0, 0.17, vUvFlow.x) *
                     (1.0 - smoothstep(0.83, 1.0, vUvFlow.x));
        float endCap = smoothstep(0.0, 0.08, vUvFlow.y) *
                       (1.0 - smoothstep(0.92, 1.0, vUvFlow.y));
        float phasePos = vUvFlow.y * 2.15 - time * (0.78 + charge * 1.55) + vPhase;
        float wave = 0.5 + 0.5 * sin(phasePos * 6.2831853);
        float pulse = pow(wave, 14.0);
        float shimmer = 0.78 + 0.22 * sin(time * 4.1 + vPhase * 17.0);
        float power = (0.12 + 1.85 * pulse + charge * 0.58 + shot * 1.7)
                      * shimmer * (0.28 + energy * 0.72);
        float alpha = edge * endCap * clamp(power * 0.53, 0.0, 0.96);
        vec3 cyan = mix(vec3(0.012, 0.16, 0.89), vec3(0.45, 0.90, 1.0),
                        clamp(pulse * 0.9 + shot * 0.5, 0.0, 1.0));
        gl_FragColor = vec4(cyan * (1.0 + charge * 0.48 + shot * 0.72), alpha);
      }
    `,
  }));

  // Data: [startXYZ, endXYZ, width, axis('top'|'side'), phase].
  // The narrow ribbons hover just above visible armor surfaces. The exact
  // mounting positions can be adjusted against actual FPS screenshots.
  const receiverStrips = [
    [-.105,.179,.25, -.105,.179,-.035,.013,'top',.02],
    [ .105,.179,.24,  .105,.179,-.040,.013,'top',.36],
    [-.040,.245,.23, -.040,.184,-.12,.010,'top',.62],
    [ .040,.245,.23,  .040,.184,-.12,.010,'top',.83],
    [-.211,.025,.20, -.211,.025,-.28,.013,'side',.18],
    [-.211,-.035,.17,-.211,-.035,-.23,.010,'side',.50],
    [ .211,.025,.19,  .211,.025,-.27,.012,'side',.73],
    [ .211,-.040,.16, .211,-.040,-.24,.010,'side',.24],
    [-.199,-.010,.34,-.199,-.010,.24,.014,'side',.43],
    [-.207,-.065,.15,-.207,-.065,-.07,.010,'side',.79],
    [-.125,.158,-.07,-.125,.110,-.27,.010,'top',.17],
    [ .125,.158,-.07, .125,.110,-.27,.010,'top',.61],
  ];
  const railStrips = [
    [-.174,.028,-.40,-.160,.015,-1.78,.015,'side',.11],
    [-.172,-.032,-.50,-.160,-.025,-1.72,.012,'side',.54],
    [ .174,.028,-.40, .160,.015,-1.78,.015,'side',.70],
    [ .172,-.032,-.50,.160,-.025,-1.72,.012,'side',.31],
    [-.116,.072,-.38,-.116,.060,-1.76,.013,'top',.85],
    [ .116,.072,-.38, .116,.060,-1.76,.013,'top',.21],
    [-.105,-.072,-.42,-.105,-.060,-1.60,.010,'top',.57],
    [ .105,-.072,-.42, .105,-.060,-1.60,.010,'top',.03],
  ];

  function mergedRibbonGeometry(defs) {
    const count = defs.length;
    const p = new Float32Array(count * 4 * 3);
    const uv = new Float32Array(count * 4 * 2);
    const phase = new Float32Array(count * 4);
    const indices = new Uint16Array(count * 6);
    for (let i = 0; i < count; i++) {
      const [x1,y1,z1,x2,y2,z2,width,axis,ph] = defs[i];
      const dx = axis === 'top' ? width * 0.5 : 0;
      const dy = axis === 'side' ? width * 0.5 : 0;
      const corners = [
        [x1-dx,y1-dy,z1,0,0], [x1+dx,y1+dy,z1,1,0],
        [x2-dx,y2-dy,z2,0,1], [x2+dx,y2+dy,z2,1,1],
      ];
      for(let j = 0; j < 4; j++) {
        const k = i*4 + j, c = corners[j];
        p[k*3] = c[0]; p[k*3+1] = c[1]; p[k*3+2] = c[2];
        uv[k*2] = c[3]; uv[k*2+1] = c[4]; phase[k] = ph;
      }
      const a = i * 4, b = i * 6;
      indices.set([a,a+1,a+2,a+1,a+3,a+2], b);
    }
    const geometry = ownGeo(new THREE.BufferGeometry());
    geometry.setAttribute('position', new THREE.BufferAttribute(p, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phase, 1));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeBoundingSphere();
    return geometry;
  }
  mount(new THREE.Mesh(mergedRibbonGeometry(receiverStrips), slitMat), receiver)
    .name = 'merged flowing energy slits - receiver';
  mount(new THREE.Mesh(mergedRibbonGeometry(railStrips), slitMat), rails)
    .name = 'merged flowing energy slits - barrel';

  // Reactor above the grip, shown from the near (-X) side. Angular plates
  // and bright co-axial rings suggest a complex powered machine without a
  // detailed asset. The whole assembly stays in the recoiling weapon rig.
  const reactor = mount(new THREE.Group(), rig);
  reactor.name = 'exposed blue reactor and radiating energy streams';
  reactor.position.set(-.33, .13, .02);
  const armor = ownMat(new THREE.MeshStandardMaterial({
    color: 0x253849, metalness: .87, roughness: .32,
  }));
  const hot = ownMat(new THREE.MeshBasicMaterial({color: 0x23a8ff, toneMapped: false}));
  const hotInner = ownMat(new THREE.MeshBasicMaterial({color: 0x8deaff, toneMapped: false}));
  const ringG = ownGeo(new THREE.TorusGeometry(.193, .025, 6, high ? 28 : 18));
  const ringInnerG = ownGeo(new THREE.TorusGeometry(.158, .012, 5, high ? 24 : 16,Math.PI*1.68));
  const ringPulseG = ownGeo(new THREE.TorusGeometry(.119, .010, 5, high ? 24 : 16,Math.PI*1.40));
  const coreG = ownGeo(new THREE.IcosahedronGeometry(.060, high ? 2 : 1));
  const face = new THREE.Group();
  face.rotation.y = -Math.PI/2;
  face.position.x = -.078;
  reactor.add(face);
  const outer = new THREE.Mesh(ringG, armor); face.add(outer);
  const spinnerA = new THREE.Mesh(ringInnerG, hot); face.add(spinnerA);
  const spinnerB = new THREE.Mesh(ringPulseG, hotInner); face.add(spinnerB);
  const nucleus = new THREE.Mesh(coreG, hotInner); nucleus.position.x = -.085; reactor.add(nucleus);
  const socketG = ownGeo(new THREE.CylinderGeometry(.138, .138, .11, high ? 16 : 10));
  const socket = new THREE.Mesh(socketG, armor); socket.rotation.z=Math.PI/2;socket.position.x=.014;reactor.add(socket);

  // Four repeating armatures rendered in a single draw call.
  const clampG = ownGeo(new THREE.BoxGeometry(.055, .055, .11));
  const fixtures = new THREE.InstancedMesh(clampG, armor, 4); face.add(fixtures);instanced.push(fixtures);
  const dummy = new THREE.Object3D();
  for (let i=0;i<4;i++) {
    const a = Math.PI*.25 + i*Math.PI*.5;
    dummy.position.set(Math.cos(a)*.204, Math.sin(a)*.204, -.02);
    dummy.rotation.set(0,0,a); dummy.scale.set(1,1,1);dummy.updateMatrix();
    fixtures.setMatrixAt(i, dummy.matrix);
  }
  fixtures.instanceMatrix.needsUpdate=true;

  // One soft, depth-tested sprite helps the pre-existing quarter-res bloom.
  const haloCanvas = document.createElement('canvas');
  haloCanvas.width=64; haloCanvas.height=64;
  const ctx=haloCanvas.getContext('2d');
  const grad=ctx.createRadialGradient(32,32,1,32,32,32);
  grad.addColorStop(0,'rgba(150,235,255,.75)');
  grad.addColorStop(.18,'rgba(50,165,255,.35)');
  grad.addColorStop(1,'rgba(0,100,255,0)');
  ctx.fillStyle=grad;ctx.fillRect(0,0,64,64);
  const haloTex=new THREE.CanvasTexture(haloCanvas);ownedTexture.push(haloTex);
  const haloMat=ownMat(new THREE.SpriteMaterial({
    map:haloTex,color:0x58bcff,opacity:.22,transparent:true,
    blending:THREE.AdditiveBlending,depthTest:true,depthWrite:false,toneMapped:false,
  }));
  const halo=new THREE.Sprite(haloMat);halo.position.set(-.16,0,0);halo.scale.setScalar(.60);reactor.add(halo);

  // Three segmented limiter arrays, but ONE instanced draw call. Their
  // longitudinal oscillation and rotation makes the barrel feel active.
  const limiterLayers = high ? 3 : 2;
  const limiterPerLayer = 3;
  const limiterCount = limiterLayers * limiterPerLayer;
  const limiterGeo=ownGeo(new THREE.TorusGeometry(.212,.011,4,high?14:10,Math.PI*.46));
  const limiterMat=ownMat(new THREE.MeshBasicMaterial({color:0x0d90ff,toneMapped:false}));
  const limiters=mount(new THREE.InstancedMesh(limiterGeo,limiterMat,limiterCount),rails);
  instanced.push(limiters);
  limiters.name='instanced active magnetic limiter segments';
  limiters.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  limiters.frustumCulled=false;

  // Plasma streamers: one ribbon-mesh draw call. Unlike WebGL line primitives,
  // these tapered luminous strips remain visible at high display resolutions.
  // Their positions are preallocated and updated in place each frame.
  const arcCount = high ? 12 : 5;
  const arcSteps = high ? 7 : 4;
  const segmentCount = arcCount * arcSteps;
  const arcPositions = new Float32Array(segmentCount * 4 * 3);
  const arcUVs = new Float32Array(segmentCount * 4 * 2);
  const arcIndices = new Uint16Array(segmentCount * 6);
  for (let i=0;i<arcCount;i++) for(let j=0;j<arcSteps;j++) {
    const n=i*arcSteps+j, a=n*4, k=n*6;
    const u0=j/arcSteps, u1=(j+1)/arcSteps;
    arcUVs.set([0,u0,1,u0,0,u1,1,u1],a*2);
    arcIndices.set([a,a+1,a+2,a+1,a+3,a+2],k);
  }
  const arcGeo=ownGeo(new THREE.BufferGeometry());
  const arcAttribute=new THREE.BufferAttribute(arcPositions,3);
  arcAttribute.setUsage(THREE.DynamicDrawUsage);
  arcGeo.setAttribute('position',arcAttribute);
  arcGeo.setAttribute('uv',new THREE.BufferAttribute(arcUVs,2));
  arcGeo.setIndex(new THREE.BufferAttribute(arcIndices,1));
  const arcUniforms={time:{value:0},charge:{value:0},shot:{value:0},energy:{value:1}};
  const arcMat=ownMat(new THREE.ShaderMaterial({
    uniforms:arcUniforms,transparent:true,depthWrite:false,depthTest:true,
    blending:THREE.AdditiveBlending,side:THREE.DoubleSide,toneMapped:false,
    vertexShader:`varying vec2 vArcUv;void main(){vArcUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`varying vec2 vArcUv;uniform float time,charge,shot,energy;
      void main(){
        float width=pow(max(0.0,1.0-abs(vArcUv.x*2.0-1.0)),1.6);
        float trail=1.0-smoothstep(0.68,1.0,vArcUv.y);
        float phase=6.2831853*(vArcUv.y*2.7-time*(1.6+charge*2.0));
        float wave=pow(0.5+0.5*sin(phase),6.0);
        float amp=(0.27+0.45*wave+charge*0.55+shot*0.7)*energy;
        float alpha=width*trail*clamp(amp,0.0,0.96);
        gl_FragColor=vec4(vec3(0.12,0.72,1.8)*(1.0+charge*0.6+shot*0.7),alpha);
      }`,
  }));
  const arcs=new THREE.Mesh(arcGeo,arcMat);
  arcs.name='batched HDR reactor plasma streamers';
  arcs.frustumCulled=false;
  reactor.add(arcs);
  const arcP0=new Float32Array(3),arcP1=new Float32Array(3);

  function arcPoint(out, offset, angle, u, t, i, strength) {
    const length=.15+.035*(i%3)+strength*.07;
    const turn=angle+.14*Math.sin(t*3.1+i*1.9+u*5.0);
    const radius=.11+u*length;
    out[offset] = -.116-u*(.10+strength*.025)+u*(1-u)*.03*Math.sin(t*11.0+i);
    out[offset+1] = Math.sin(turn)*radius+.015*u*Math.sin(t*9.3+i*3.7);
    out[offset+2] = Math.cos(turn)*radius-.18*u+.025*u*Math.sin(t*8.1+i*4.9);
  }

  function update(dt, state=EMPTY_STATE) {
    if(dead)return;state=state||EMPTY_STATE;dt=Math.max(0,number(dt,0));
    const t=number(state.time,0), charge=clamp(number(state.charge,0),0,1);
    const energy=clamp(number(state.energy,100)/100,0,1);
    const reloading=number(state.reload,-1)>=0;
    const motionT=state.reducedMotion ? 0 : t;
    shotBoost=Math.max(0,shotBoost-Math.max(0,dt)*10);
    const flash=clamp(Math.max(number(state.flash,0),shotBoost),0,2);
    const power=reloading?.08:(.32+energy*.68);
    lastCharge=charge;lastEnergy=energy;lastReload=reloading;lastMotionTime=motionT;
    uniforms.time.value=motionT;
    uniforms.charge.value=charge;
    uniforms.shot.value=flash;
    uniforms.energy.value=power;

    spinnerA.rotation.z=motionT*(1.0+charge*5.5);spinnerA.rotation.x=.24;
    spinnerB.rotation.z=-motionT*(1.35+charge*7.0);spinnerB.rotation.y=-.30;
    const pulse=1 + Math.sin(motionT*6.0)*.045 + charge*.12+flash*.20;
    nucleus.scale.setScalar(pulse);
    hot.color.setRGB(.08,.38+charge*.18+flash*.22,1.0+charge*.65+flash*.5).multiplyScalar(.25+.75*power);
    hotInner.color.setRGB(.10+charge*.08+flash*.10,.47+charge*.15+flash*.14,.95+charge*.30+flash*.30).multiplyScalar(.25+.75*power);
    haloMat.opacity=(.035+.04*charge+.06*flash)*power;
    halo.scale.setScalar(.46+.06*charge+.08*flash);

    for (let i=0;i<limiterCount;i++) {
      const row=Math.floor(i/limiterPerLayer),seg=i%limiterPerLayer;
      dummy.position.set(0,0,-.70-row*.43+Math.sin(motionT*(1.9+row*.2)+row*2.0)*(.043+charge*.045));
      dummy.rotation.set(0,0,seg*Math.PI*2/limiterPerLayer+motionT*(.22+charge*1.9)*(row%2?-1:1));
      dummy.scale.setScalar(1-row*.05+charge*.022);dummy.updateMatrix();
      limiters.setMatrixAt(i,dummy.matrix);
    }
    limiters.instanceMatrix.needsUpdate=true;
    limiterMat.color.setRGB(.018,.27+charge*.28+flash*.25,.82+charge*.28+flash*.40).multiplyScalar(.25+.75*power);

    // No allocations in the frame loop. Each segment is a camera-side-facing
    // quad; the combined geometry is one dynamic buffer and one draw call.
    const strength=charge*.85+flash*.65;
    arcUniforms.time.value=motionT;
    arcUniforms.charge.value=charge;
    arcUniforms.shot.value=flash;
    arcUniforms.energy.value=power;
    let o=0;
    for(let i=0;i<arcCount;i++){
      const angle=i*2.399963229728653;
      for(let k=0;k<arcSteps;k++){
        arcPoint(arcP0,0,angle,k/arcSteps,motionT,i,strength);
        arcPoint(arcP1,0,angle,(k+1)/arcSteps,motionT,i,strength);
        const dy=arcP1[1]-arcP0[1],dz=arcP1[2]-arcP0[2];
        const invLen=1/(Math.hypot(dy,dz)||1);
        const width=.005+charge*.004+flash*.006;
        const oy=-dz*invLen*width,oz=dy*invLen*width;
        arcPositions[o++]=arcP0[0];arcPositions[o++]=arcP0[1]-oy;arcPositions[o++]=arcP0[2]-oz;
        arcPositions[o++]=arcP0[0];arcPositions[o++]=arcP0[1]+oy;arcPositions[o++]=arcP0[2]+oz;
        arcPositions[o++]=arcP1[0];arcPositions[o++]=arcP1[1]-oy;arcPositions[o++]=arcP1[2]-oz;
        arcPositions[o++]=arcP1[0];arcPositions[o++]=arcP1[1]+oy;arcPositions[o++]=arcP1[2]+oz;
      }
    }
    arcAttribute.needsUpdate=true;
    arcs.visible=power>.09;
  }

  function fire(power=1){
    if(dead)return;
    lastPower=clamp(number(power,1),1,4);
    shotBoost=clamp(.7+lastPower*.2,0,1.5);
  }
  function stats(){return {slits:receiverStrips.length+railStrips.length,slitMeshes:2,
    limiterLayers,limiterInstances:limiterCount,arcStreams:arcCount,arcSegments:segmentCount,
    extraDrawables:11,ownedGeometries:ownedGeometry.length,ownedMaterials:ownedMaterial.length,ownedTextures:ownedTexture.length,
    reactor:reactor.name,reactorPosition:reactor.position.toArray(),charge:lastCharge,energy:lastEnergy,reloading:lastReload,motionTime:lastMotionTime,shot:shotBoost,disposed:dead};}
  function dispose(){
    if(dead)return;dead=true;
    for(const m of mounts)m.removeFromParent();
    for(const m of instanced)m.dispose();
    for(const g of ownedGeometry)g.dispose();
    for(const m of ownedMaterial)m.dispose();
    for(const t of ownedTexture)t.dispose();
    reactor.clear();
  }
  update(0,EMPTY_STATE);
  return {update,fire,dispose,stats};
}
