import * as THREE from '../../vendor/three.module.js';
const NO_OPTIONS=Object.freeze({});

// Camera-local, peripheral-only pickup pulse. No lights, textures or new allocations
// are created by trigger()/update(). Repeated pickups refresh one bounded pulse.
export function createPickupFeedback(scene,{quality='high'}={}){
 const low=quality==='low',duration=.5,hexCount=low?10:18,particleCount=low?16:40;
 const root=new THREE.Group();root.name='pickup / peripheral induction pulse';root.visible=false;scene.add(root);
 const uniforms={envelope:{value:0},gain:{value:1}};
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,toneMapped:false,uniforms,
  vertexShader:`varying vec4 clipPosition;varying vec3 viewNormal;void main(){vec4 local=vec4(position,1.);vec3 n=normal;
#ifdef USE_INSTANCING
local=instanceMatrix*local;n=mat3(instanceMatrix)*n;
#endif
viewNormal=normalize(normalMatrix*n);clipPosition=projectionMatrix*modelViewMatrix*local;gl_Position=clipPosition;}`,
  fragmentShader:`varying vec4 clipPosition;varying vec3 viewNormal;uniform float envelope,gain;void main(){vec2 ndc=clipPosition.xy/max(.001,clipPosition.w);float peripheral=smoothstep(.23,.46,length(ndc*vec2(1.,.8)));float a=envelope*peripheral*(.45+.55*abs(viewNormal.z));if(a<.001)discard;gl_FragColor=vec4(vec3(.035,.70,2.2)*gain,a);}`});
 const ringGeo=new THREE.TorusGeometry(1,.012,low?4:6,low?40:72);
 const hexGeo=new THREE.RingGeometry(.13,.145,6),particleGeo=new THREE.OctahedronGeometry(.025,0);
 const rings=[];
 for(let i=0;i<3;i++){const mesh=new THREE.Mesh(ringGeo,material);mesh.renderOrder=12;mesh.frustumCulled=false;root.add(mesh);rings.push(mesh);}
 const hexes=new THREE.InstancedMesh(hexGeo,material,hexCount),particles=new THREE.InstancedMesh(particleGeo,material,particleCount);
 for(const mesh of [hexes,particles]){mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;mesh.renderOrder=12;root.add(mesh);}
 const dummy=new THREE.Object3D(),hexAngles=new Float32Array(hexCount),particleAngles=new Float32Array(particleCount),particleSeeds=new Float32Array(particleCount);
 for(let i=0;i<hexCount;i++)hexAngles[i]=(i+.5)/hexCount*Math.PI*2;
 for(let i=0;i<particleCount;i++){particleAngles[i]=(i+.23)/particleCount*Math.PI*2;particleSeeds[i]=((i*37+11)%101)/101;}
 let age=duration,upgrade=false,dead=false,triggered=0,upgrades=0,lastReduced=false;
 function trigger({upgrade:nextUpgrade=false}=NO_OPTIONS){if(dead)return;age=0;upgrade=!!nextUpgrade;triggered++;if(upgrade)upgrades++;root.visible=true;}
 function update(dt,time,camera,{reducedMotion=false}=NO_OPTIONS){
  if(dead)return;root.position.copy(camera.position);root.quaternion.copy(camera.quaternion);lastReduced=!!reducedMotion;
  if(age>=duration){root.visible=false;return;}age=Math.min(duration,age+(Number.isFinite(dt)?Math.max(0,dt):0));
  const t=age/duration,attack=Math.min(1,t/.09),fade=Math.pow(Math.max(0,1-t),1.3),motion=reducedMotion?0:1;
  root.visible=age<duration;uniforms.envelope.value=attack*fade*(reducedMotion?.38:upgrade?.72:.53);uniforms.gain.value=upgrade?1.5:1;
  for(let i=0;i<rings.length;i++){const ring=rings[i];ring.position.set(0,-.70+i*.20+t*.28*motion,-.10);ring.rotation.set(Math.PI/2+i*.035*motion,0,motion*t*(i%2?-.45:.45));ring.scale.setScalar(1.18+i*.13+t*.15*motion);}
  for(let i=0;i<hexCount;i++){const a=hexAngles[i]+t*.12*motion,r=1+Math.sin(i*2.3)*.07;dummy.position.set(Math.cos(a)*1.47*r,Math.sin(a)*.84*r-.04,-1.35);dummy.rotation.set(0,0,a+t*.30*motion);dummy.scale.setScalar((upgrade?1.1:.88)*(1+t*.18*motion));dummy.updateMatrix();hexes.setMatrixAt(i,dummy.matrix);}
  hexes.instanceMatrix.needsUpdate=true;
  for(let i=0;i<particleCount;i++){const a=particleAngles[i],seed=particleSeeds[i],r=1+seed*.14;dummy.position.set(Math.cos(a)*1.40*r,Math.sin(a)*.76*r-.18+t*(.35+seed*.40)*motion,-1.32-seed*.18);dummy.rotation.set(a,0,a+t*motion);const s=(.75+seed*.8)*(1-t*.50);dummy.scale.set(s,s*(reducedMotion?1:2.8),s);dummy.updateMatrix();particles.setMatrixAt(i,dummy.matrix);}
  particles.instanceMatrix.needsUpdate=true;
 }
 function stats(){return {active:!dead&&age<duration,age,duration,triggered,upgrades,upgrade,reducedMotion:lastReduced,hexCount,particleCount,drawCalls:5};}
 function dispose(){if(dead)return;dead=true;root.removeFromParent();hexes.dispose();particles.dispose();ringGeo.dispose();hexGeo.dispose();particleGeo.dispose();material.dispose();root.clear();}
 return {trigger,update,stats,dispose};
}
