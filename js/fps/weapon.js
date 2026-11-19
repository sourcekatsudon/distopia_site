import * as THREE from '../../vendor/three.module.js';
import {createSurfaceKit} from './material-kit.js';
import {createRailgunEnergyFX} from './railgun-energy-fx.js';

// +Z breech, -Z muzzle. Named groups are independent mechanical assemblies.
export function createRailgun({quality='high'}={}) {
 const high=quality==='high',N=high?20:10,R=Math.PI/2,root=new THREE.Group();root.name='ARC-RG7 / BLUE REQUIEM';
 const geometries=new Set(),materials=new Set(),textures=new Set();
 const geo=g=>(geometries.add(g),g),mat=p=>{const m=new THREE.MeshStandardMaterial(p);materials.add(m);return m;};
 const surfaces=createSurfaceKit({quality}),copy=m=>{const c=m.clone();materials.add(c);return c;};
 const metal=copy(surfaces.gunmetal),black=copy(surfaces.anodized),titanium=copy(surfaces.titanium),ceramic=copy(surfaces.ceramic),rubber=copy(surfaces.rubber),copper=mat({color:0x79664e,metalness:.9,roughness:.38});
 const brushCanvas=document.createElement('canvas');brushCanvas.width=brushCanvas.height=128;const bc=brushCanvas.getContext('2d');for(let y=0;y<128;y++){const v=142+Math.sin(y*2.1)*9;bc.fillStyle='rgb('+v+','+v+','+v+')';bc.fillRect(0,y,128,1);}const brush=new THREE.CanvasTexture(brushCanvas);brush.wrapS=brush.wrapT=THREE.RepeatWrapping;textures.add(brush);for(const m of [metal,black,titanium]){m.normalMap=null;m.metalnessMap=null;m.roughnessMap=brush;m.roughness=m===black?.63:m===metal?.62:.47;}
 const blue=mat({color:0x063761,emissive:0x006dff,emissiveIntensity:1.6,metalness:.35,roughness:.25}),core=mat({color:0x1d8ac5,emissive:0x00adff,emissiveIntensity:1.3,metalness:.2,roughness:.2});
 const group=(name,p=root)=>{const g=new THREE.Group();g.name=name;p.add(g);return g;};
 const rig=group('recoil cradle'),receiver=group('faceted receiver',rig),slide=group('reciprocating breech',rig),rails=group('split rail assembly',rig),cell=group('capacitor cartridge',receiver),collars=[],leaves=[],carriers=[];
 const mesh=(g,m,p,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);p.add(o);return o;};
 const boxG=geo(new THREE.BoxGeometry(1,1,1)),cylG=geo(new THREE.CylinderGeometry(1,1,1,N)),boltG=geo(new THREE.CylinderGeometry(1,1,1,6));
 const box=(w,h,d,m,p,x,y,z,rz=0)=>{const o=mesh(boxG,m,p,x,y,z,0,0,rz);o.scale.set(w,h,d);return o;};
 const cylinder=(r,l,m,p,x,y,z)=>{const o=mesh(cylG,m,p,x,y,z,R);o.scale.set(r,l,r);return o;};
 const bolt=(p,x,y,z)=>{const o=mesh(boltG,titanium,p,x,y,z,0,0,R);o.scale.set(.014,.012,.014);};
 function profile(points,w,m,p,x=0,y=0,z=0){const shape=new THREE.Shape();points.forEach(([a,b],i)=>i?shape.lineTo(a,b):shape.moveTo(a,b));shape.closePath();const g=geo(new THREE.ExtrudeGeometry(shape,{depth:w,bevelEnabled:true,bevelSize:.012,bevelThickness:.008,bevelSegments:1,steps:1}));g.translate(0,0,-w/2);g.rotateY(R);return mesh(g,m,p,x,y,z);}
 function tube(points,r,m,p){return mesh(geo(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),high?24:12,r,6,false)),m,p);}
 function rod(a,b,r,m,p){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),o=mesh(cylG,m,p);o.position.copy(av).add(bv).multiplyScalar(.5);o.scale.set(r,av.distanceTo(bv),r);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),bv.sub(av).normalize());return o;}

 // A variable-section superellipse loft. Large shells have continuous rounded shoulders,
 // pinched waists and tapered ends rather than constant-depth extruded panels.
 function loft(sections,m,parent,cx=0){
  const count=high?32:16,positions=[],uvs=[],indices=[];
  sections.forEach(([z,w,h,cy=0,n=4],j)=>{for(let i=0;i<count;i++){const a=i/count*Math.PI*2,c=Math.cos(a),v=Math.sin(a);positions.push(cx+Math.sign(c)*Math.pow(Math.abs(c),2/n)*w,cy+Math.sign(v)*Math.pow(Math.abs(v),2/n)*h,z);uvs.push(i/count,j/(sections.length-1));}});
  for(let j=0;j<sections.length-1;j++)for(let i=0;i<count;i++){const a=j*count+i,b=j*count+(i+1)%count,c=a+count,d=b+count;indices.push(a,c,b,b,c,d);}
  for(const [j,flip]of [[0,false],[sections.length-1,true]]){const section=sections[j],center=positions.length/3;positions.push(cx,section[3]||0,section[0]);uvs.push(.5,.5);for(let i=0;i<count;i++){const a=j*count+i,b=j*count+(i+1)%count;indices.push(center,flip?b:a,flip?a:b);}}
  const g=geo(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return mesh(g,m,parent);
 }
 // Three structural volumes: rear breech, pinched receiver and forked accelerator socket.
 loft([[.48,.09,.065,-.025,8],[.37,.17,.105,.005,8],[.12,.17,.105,.005,8],[-.12,.14,.085,.015,8],[-.30,.115,.065,.025,6],[-.40,.105,.065,.025,6]],metal,receiver);
 profile([[-.38,.045],[-.26,.15],[.04,.15],[.26,.07],[.10,.02]],.23,black,receiver,0,.025);
 // Separate compound upper shells leave the breech mechanism visible in the central recess.
 for(const sx of [-1,1]){
  profile([[-.39,-.04],[-.28,.065],[.03,.065],[.23,-.015],[.12,-.10],[-.25,-.10]],.018,titanium,receiver,sx*.177);
  profile([[-.32,-.025],[-.24,.035],[.01,.035],[.15,-.02],[.07,-.065],[-.22,-.065]],.02,black,receiver,sx*.190);

  // Machined face inserts have a small scale and a purpose, rather than covering the entire shell.
  profile([[-.32,-.04],[-.20,.035],[.01,.035],[.14,-.02],[.03,-.09],[-.18,-.10]],.018,ceramic,receiver,sx*.188);
  for(const z of [.30,-.05])bolt(receiver,sx*.205,-.018,z);
  rod([sx*.145,-.105,.32],[sx*.145,-.105,-.40],.020,black,receiver);
  rod([sx*.145,-.105,-.18],[sx*.145,-.105,-.63],.009,titanium,slide);
  // Long curved fork/socket makes receiver-to-rail transition unmistakable.
  loft([[-.16,.045,.045,.025],[-.29,.067,.077,.025],[-.42,.055,.070,.025],[-.62,.045,.056,.025]],metal,receiver,sx*.116);
 }
 cylinder(.053,.36,black,receiver,0,.15,.13);
 for(let i=0;i<4;i++){cylinder(.061,.016,titanium,receiver,0,.15,.26-i*.075);cylinder(.049,.025,blue,receiver,0,.15,.24-i*.075);}
 loft([[.35,.050,.020,.195],[.23,.068,.032,.21],[.05,.065,.027,.20],[-.14,.045,.022,.15]],metal,slide);
 for(let i=0;i<5;i++)box(.12,.013,.025,black,slide,0,.245,.23-i*.065);
 // Open magnetic throat: two rails, ceramic insulators and an empty central channel.
 for(const sx of [-1,1]){
  const c=group(sx<0?'port electromagnetic rail':'starboard electromagnetic rail',rails);c.position.x=sx*.116;carriers.push([c,sx]);
  loft([[-.23,.043,.045,0],[-.38,.054,.067,0],[-.75,.051,.061,0],[-1.28,.044,.054,0],[-1.70,.036,.044,0],[-1.84,.025,.030,0]],metal,c);
  box(.020,.018,1.48,core,c,-sx*.024,.076,-1.02);box(.018,.018,1.45,blue,c,sx*.036,-.047,-1.02);
  for(let i=0;i<3;i++){const z=-.58-i*.48;box(.094,.118,.045,ceramic,c,0,-.005,z);box(.087,.014,.05,titanium,c,0,.061,z);bolt(c,sx*.053,-.012,z);}
 }
 const fieldMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,toneMapped:false,uniforms:{time:{value:0},charge:{value:0},flash:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float time,charge,flash;void main(){float edge=pow(max(0.,1.-abs(vUv.x*2.-1.)),2.);float stream=pow(.5+.5*sin(vUv.y*65.-time*(14.+charge*40.)),8.);float a=edge*sin(vUv.y*3.14159)*(.10+.2*stream+charge*.20+flash*.3);gl_FragColor=vec4(.015,.28+.30*stream,.95,a);}'});materials.add(fieldMat);
 const fieldG=geo(new THREE.PlaneGeometry(.19,1.43));mesh(fieldG,fieldMat,rails,0,.014,-1.04,-R);mesh(fieldG,fieldMat,rails,0,.014,-1.04,R,R);
 // Segmented magnetic collars have visible copper windings and dark structural gaps.
 const arcG=geo(new THREE.TorusGeometry(.24,.028,6,high?16:8,Math.PI*.24));
 for(let i=0;i<3;i++){
  const collar=group('accelerator collar '+(i+1),rails);collar.position.z=-.58-i*.48;collar.scale.setScalar(1-i*.055);collars.push(collar);
  for(let j=0;j<6;j++){if(j===1&&i<2)continue;const seg=group('magnetic segment '+j,collar);seg.rotation.z=j*Math.PI/3;
   box(.115,.057,.16,black,seg,0,.235,0);box(.083,.022,.12,titanium,seg,0,.271,0);box(.073,.018,.11,blue,seg,0,.199,0);box(.068,.006,.05,blue,seg,0,.287,0);
   for(let k=0;k<3;k++)mesh(arcG,copper,seg,0,0,-.045+k*.044,0,0,Math.PI*.38);
  }
 }
 const accelerator=group('terminal accelerator',rails);accelerator.position.z=-1.88;
 for(let i=0;i<4;i++){const g=group('muzzle prong '+i,accelerator);g.rotation.z=Math.PI/4+i*R;profile([[-.07,-.035],[.12,-.035],[.22,.01],[.12,.065],[-.07,.065]],.075,titanium,g,0,.12);box(.04,.018,.21,core,g,0,.10,-.07);}
 const muzzle=new THREE.Object3D();muzzle.name='ballistic muzzle';muzzle.position.set(0,0,-2.15);rails.add(muzzle);
 // Camera-facing cartridge, cable loops and hydraulic rods anchor the gun's physical scale.
 const cellGlow=blue.clone();materials.add(cellGlow);cell.scale.setScalar(.78);cell.position.set(-.265,-.075,.12);cylinder(.066,.34,cellGlow,cell,0,0,0);
 for(let j=0;j<6;j++){const a=j*Math.PI/3;box(.018,.018,.32,titanium,cell,Math.cos(a)*.077,Math.sin(a)*.077,0);}
 for(const z of [-.22,-.15,.15,.22])cylinder(.092,.033,metal,cell,0,0,z);
 for(const z of [-.235,.235])cylinder(.053,.018,core,cell,0,0,z);
 tube([[-.29,-.06,.35],[-.37,-.02,.45],[-.37,.14,.20],[-.23,.16,-.15]],.010,rubber,receiver);
 tube([[-.30,-.08,-.10],[-.38,-.08,-.24],[-.30,-.02,-.46],[-.13,0,-.6]],.009,copper,receiver);
 tube([[-.31,-.08,-.10],[-.40,-.035,-.29],[-.28,.04,-.48],[-.13,.02,-.62]],.0045,blue,receiver);
 for(const sx of [-1,1])for(let i=0;i<5;i++){
  const leaf=group('hinged coolant leaf '+sx+'/'+i,receiver);leaf.position.set(sx*.14,.16,.20-i*.105);leaves.push([leaf,sx]);
  box(.11,.016,.068,metal,leaf,sx*.045,0,0,-sx*.28);box(.082,.008,.04,titanium,leaf,sx*.055,.012,0,-sx*.28);box(.015,.025,.055,blue,receiver,sx*.14,.14,.20-i*.105);
 }
 profile([[-.41,-.13],[-.21,-.12],[-.15,-.24],[-.26,-.50],[-.40,-.46]],.12,rubber,receiver);
 for(let i=0;i<5;i++)box(.14,.018,.09,metal,receiver,0,-.27-i*.034,.30+i*.017);
 tube([[0,-.13,.12],[0,-.29,.08],[0,-.32,.22],[0,-.2,.29]],.014,titanium,receiver);
 const hand=group('armored firing hand',rig);profile([[-.38,-.2],[-.25,-.19],[-.18,-.3],[-.26,-.42],[-.4,-.38]],.17,rubber,hand,.02);
 for(let i=0;i<4;i++)box(.10,.042,.058,ceramic,hand,-.075,-.235-i*.043,.265+i*.015,-.15);
 rod([.045,-.38,.39],[.24,-.59,.94],.075,rubber,rig);rod([.08,-.39,.43],[.29,-.60,.94],.045,metal,rig);
 profile([[-.71,-.52],[-.48,-.4],[-.30,-.42],[-.48,-.60]],.22,metal,rig,.17);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#101b25';ctx.fillRect(0,0,512,256);ctx.fillStyle='#aac4d2';ctx.font='bold 52px monospace';ctx.fillText('ARC-RG7',24,64);ctx.font='21px monospace';ctx.fillStyle='#48bfff';ctx.fillText('BLUE REQUIEM',26,102);ctx.fillStyle='#657d8c';ctx.font='14px monospace';ctx.fillText('MAGNETIC ACCELERATOR // 07',26,143);ctx.fillText('CAUTION : ACTIVE FIELD',26,167);ctx.fillStyle='#b8a16d';for(let i=0;i<15;i++)ctx.fillRect(26+i*15,195,7,17);ctx.fillStyle='#628094';ctx.font='12px monospace';ctx.fillText('CH / EXPERIMENTAL DIVISION',26,240);
 const labelTex=new THREE.CanvasTexture(canvas);labelTex.colorSpace=THREE.SRGBColorSpace;textures.add(labelTex);mesh(geo(new THREE.PlaneGeometry(.28,.14)),mat({map:labelTex,roughness:.55,metalness:.35}),receiver,-.202,-.015,.16,0,-R);
 mesh(geo(new THREE.PlaneGeometry(.105,.23)),mat({map:labelTex,roughness:.4,metalness:.2}),receiver,-.115,.256,.02,-R);
 // Eight original angular glyphs: physical emissive strokes, never a numeric counter.
 const glyphMaterial=core.clone();glyphMaterial.emissiveIntensity=.48;materials.add(glyphMaterial);
 const meter=group('glyph energy annunciator',receiver);meter.scale.setScalar(.90);meter.position.set(-.17,.20,.18);meter.rotation.z=.25;
 box(.18,.018,.32,black,meter,0,0,0);box(.185,.004,.326,titanium,meter,0,-.01,0);
 rod([-.12,.14,.08],[-.19,.23,.08],.012,metal,receiver);rod([-.12,.14,.28],[-.19,.23,.28],.012,metal,receiver);
 const glyphs=[],strokes=[[-.024,-.016,-.024,.016],[-.024,-.016,.022,-.016],[-.024,0,.022,0],[.022,-.016,.022,.016],[-.024,.016,.022,.016],[-.024,-.016,.022,.016],[-.024,.016,.022,-.016]];
 for(let i=0;i<8;i++){
  const glyph=group('energy glyph '+i,meter),gx=(i%2?1:-1)*.043,gz=(Math.floor(i/2)-1.5)*.068;glyphs.push(glyph);
  for(let j=0;j<strokes.length;j++)if(((i*13+37)>>(j%6))&1||j===0){const [x1,z1,x2,z2]=strokes[j],length=Math.hypot(x2-x1,z2-z1),x=gx+(x1+x2)/2,z=gz+(z1+z2)/2;const unlit=box(.004,.003,length,ceramic,meter,x,.012,z);unlit.rotation.y=Math.atan2(x2-x1,z2-z1);const lit=box(.003,.003,length,glyphMaterial,glyph,x,.015,z);lit.rotation.y=unlit.rotation.y;}
 }
 const support=group('left support hand',rig),supportArm=group('left armored forearm',rig);
 profile([[-.09,-.055],[.09,-.055],[.12,.015],[.06,.075],[-.07,.065]],.15,rubber,support);
 const fingerGeo=geo(new THREE.CapsuleGeometry(.025,.055,3,8));
 for(let i=0;i<4;i++){mesh(fingerGeo,rubber,support,.015+i*.032,.045,-.065,R,0,R);box(.028,.024,.048,ceramic,support,.012+i*.032,.061,-.043);}
 box(.17,.10,.09,ceramic,support,0,-.045,.10);
 mesh(fingerGeo,rubber,hand,-.11,-.20,.30,.2,0,-.4);
 const thumb=mesh(fingerGeo,rubber,support,-.095,.06,.015,.35,0,-.35);thumb.scale.y=1.3;
 // Forearm pivots with the support hand. Its lower end stays below the viewport.
 cylinder(.058,1,rubber,supportArm,0,0,.5);profile([[-.34,-.045],[.03,-.045],[.06,.025],[-.16,.085],[-.30,.065]],.14,metal,supportArm,0,0,.06);
 box(.025,.01,.14,blue,supportArm,-.05,.075,.2);
 // Local, depth-tested optical halos, not a screen-wide exposure boost.
 const glowCanvas=document.createElement('canvas');glowCanvas.width=128;glowCanvas.height=128;const gc=glowCanvas.getContext('2d'),grad=gc.createRadialGradient(64,64,0,64,64,64);grad.addColorStop(0,'rgba(30,140,255,.6)');grad.addColorStop(.25,'rgba(0,85,255,.22)');grad.addColorStop(1,'rgba(0,40,255,0)');gc.fillStyle=grad;gc.fillRect(0,0,128,128);const glowTex=new THREE.CanvasTexture(glowCanvas);textures.add(glowTex);
 const spriteMat=opacity=>{const m=new THREE.SpriteMaterial({map:glowTex,color:0x3baaff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,opacity});materials.add(m);return m;};
 const haloMat=spriteMat(.28),halo=new THREE.Sprite(haloMat);halo.scale.set(.75,.75,1);halo.position.set(0,0,-1.2);rails.add(halo);
 const flashMat=spriteMat(0),flashSprite=new THREE.Sprite(flashMat);muzzle.add(flashSprite);
 const flashCoreMat=new THREE.MeshBasicMaterial({color:0xb0eaff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});materials.add(flashCoreMat);const flashCore=mesh(geo(new THREE.ConeGeometry(.13,.55,6,1,true)),flashCoreMat,muzzle,0,0,-.23,-R);
 const keyLight=new THREE.PointLight(0xc9d7e3,3.1,4,2);keyLight.position.set(-.65,.7,.25);rig.add(keyLight);
 const light=new THREE.PointLight(0x168cff,0,3,2);light.position.set(-.2,.2,-.8);rig.add(light);
 // Merge only static siblings. Moving groups keep their own transforms and hierarchy.
 function batch(parent){for(const c of [...parent.children])if(c.isGroup)batch(c);const bins=new Map();for(const o of parent.children)if(o.isMesh){const list=bins.get(o.material)||[];list.push(o);bins.set(o.material,list);}for(const [m,list]of bins){if(list.length<2)continue;const arrays={position:[],normal:[],uv:[]};for(const o of list){o.updateMatrix();const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrix);for(const key of Object.keys(arrays))arrays[key].push(...g.getAttribute(key).array);g.dispose();}const g=geo(new THREE.BufferGeometry());for(const key of Object.keys(arrays))g.setAttribute(key,new THREE.Float32BufferAttribute(arrays[key],key==='uv'?2:3));mesh(g,m,parent).name='batched '+parent.name;list.forEach(o=>parent.remove(o));}}
 for(const c of collars)for(const seg of [...c.children]){seg.updateMatrix();for(const o of [...seg.children]){o.updateMatrix();o.applyMatrix4(seg.matrix);c.add(o);}c.remove(seg);}
 batch(rig);
 const energyFX=createRailgunEnergyFX({rig,receiver,rails,quality}),energyState={time:0,charge:0,flash:0,energy:100,reload:-1,reducedMotion:false};
 const wrist=new THREE.Vector3(),elbow=new THREE.Vector3(),wristOffset=new THREE.Vector3(-.015,-.09,.04),forearmAxis=new THREE.Vector3(0,0,1);
 let recoil=0,heat=0,flash=0,power=1,spin=0,focus=0,drive=0,mechanicalState='IDLE',disposed=false;
 function fire(p=1){power=Math.min(4,Math.max(1,p));recoil=1;heat=Math.min(1,heat+.40+power*.12);flash=1;energyFX.fire(power);}
 function update(dt,s={}){const t=s.time||0,ch=Math.max(s.charge||0,focus>0?.4:0),dep=s.deploy??1;focus=Math.max(0,focus-dt);recoil*=Math.exp(-dt*12);heat*=Math.exp(-dt*1.65);flash*=Math.exp(-dt*24);spin+=dt*(.12+ch*2.8+flash*4);drive+=(ch-drive)*(1-Math.exp(-dt*9));mechanicalState=flash>.25?'FIRING':recoil>.08?'RECOIL':heat>.22?'COOLING':focus>0?'PRECHARGE':ch>.98?'FULLY_CHARGED':ch>.01?'CHARGING':heat>.02?'RECOVERY':'IDLE';glyphMaterial.emissiveIntensity=.42+ch*.23;
  blue.emissiveIntensity=1.15+Math.sin(t*3)*.12+ch*1.7+flash*2;core.emissiveIntensity=1.05+ch*1.2+flash*2.3;fieldMat.uniforms.time.value=t;fieldMat.uniforms.charge.value=ch;fieldMat.uniforms.flash.value=flash;
  collars.forEach((g,i)=>{g.rotation.z=(i%2?-1:1)*spin*.20;g.position.z=-.58-i*.48-drive*(.025+i*.018)+recoil*.035*(3-i);});carriers.forEach(([g,sx])=>{g.position.x=sx*(.116+drive*.016+recoil*.015);g.rotation.z=sx*(ch*.018+Math.sin(t*1.7)*.002);});leaves.forEach(([g,sx],i)=>g.rotation.z=sx*(heat*(.56+(i%5)*.045)+drive*.15+Math.sin(t*2+i)*.008));rails.position.z=-drive*.11+recoil*.018;slide.position.z=recoil*.13-ch*.035;cell.rotation.z=Math.sin(t*1.4)*.006;
  const rp=s.reload??-1,reloading=rp>=0;
  const smooth=x=>{const v=Math.max(0,Math.min(1,x));return v*v*(3-2*v);};
  const hold=reloading?smooth(rp/.15)*(1-smooth((rp-.85)/.15)):0;
  const pull=reloading?(rp<.52?smooth((rp-.23)/.24):1-smooth((rp-.58)/.24)):0;
  cell.position.set(-.265-pull*.18,-.075-pull*.64,.12+pull*.18);cell.rotation.z=-pull*.28;cell.visible=!(reloading&&rp>.48&&rp<.58);
  cellGlow.emissiveIntensity=(reloading&&rp<.58?.15:1.1)+ch*1.3+flash*1.5;
  const visibleEnergy=reloading?(rp>.83?smooth((rp-.83)/.14)*100:0):(s.energy??100),lit=Math.ceil(Math.max(0,visibleEnergy)/12.5);glyphs.forEach((g,i)=>g.visible=i<lit);
  const reach=reloading?smooth((rp-.08)/.13)*(1-smooth((rp-.83)/.13)):0;
  support.position.set(-.26+(-.005-pull*.18)*reach,-.10+(.025-pull*.64)*reach,-.42+(.54+pull*.18)*reach);support.rotation.set(-.1-reach*.2,reach*.25,reach*.35);
  wrist.copy(support.position).add(wristOffset);elbow.set(-.52,-.67,.72);const armLength=wrist.distanceTo(elbow);supportArm.position.copy(wrist);supportArm.quaternion.setFromUnitVectors(forearmAxis,elbow.sub(wrist).normalize());supportArm.scale.z=armLength;
  const breath=s.reducedMotion?0:Math.sin(t*(s.sprinting?2.5:1.65)),breathSide=s.reducedMotion?0:Math.sin(t*.825);
  const movement=Math.min((s.speed||0)/6,1)*(s.grounded===false?.15:1),bob=Math.sin(t*8)*movement;rig.position.set(bob*.009+breathSide*.015,-(1-dep)*.8-Math.abs(bob)*.009+breath*.030-hold*.08,recoil*.11+hold*.09);rig.rotation.set(recoil*.055+(1-dep)*.55+(s.sprinting?.12:0)+hold*.10+breath*.015,bob*.01-hold*.10,bob*.012-recoil*.012+hold*.24+breathSide*.010);
  energyState.time=t;energyState.charge=ch;energyState.flash=flash;energyState.energy=visibleEnergy;energyState.reload=rp;energyState.reducedMotion=Boolean(s.reducedMotion);energyFX.update(dt,energyState);
  haloMat.opacity=.20+ch*.23+flash*.25;halo.scale.setScalar(.55+ch*.22+flash*.25);flashMat.opacity=flash*.60;flashSprite.scale.setScalar((.65+power*.23)*Math.sqrt(flash));flashCoreMat.opacity=flash*.85;flashCore.scale.set(1+power*.15,1+power*.20,1+power*.15);light.intensity=ch*.45+flash*3.5;
 }
 function dispose(){if(disposed)return;disposed=true;root.removeFromParent();energyFX.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());surfaces.dispose();root.clear();}
 return {root,muzzle,update,fire,inspect:()=>({state:mechanicalState,glyphs:glyphs.filter(g=>g.visible).length,cellVisible:cell.visible,cellOffset:cell.position.toArray(),breathPosition:rig.position.toArray(),supportHand:support.position.toArray(),flash,energyFX:energyFX.stats()}),prepare:()=>{focus=.095;},dispose};
}
