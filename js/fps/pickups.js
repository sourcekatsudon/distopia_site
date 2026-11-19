import * as THREE from '../../vendor/three.module.js';
import {GUARANTEED_REWARDS,collectModule} from './campaign.js';

// Proposal for site/js/fps/pickups.js. Collection and supplement-floor semantics
// are intentionally preserved; level caps must be handled by campaign.js.
export function createPickups(scene,{state,onCollect=()=>{}}){
 const root=new THREE.Group();root.name='high visibility upgrade module rewards';scene.add(root);const items=new Map();
 const geo=new THREE.OctahedronGeometry(.42,0),ringGeo=new THREE.TorusGeometry(.62,.025,5,24),haloGeo=new THREE.RingGeometry(.57,.95,32),beaconGeo=new THREE.CylinderGeometry(.035,.22,1.65,8,1,true);
 const material=new THREE.MeshStandardMaterial({color:0x0b345d,emissive:new THREE.Color(.045,.85,2.4),emissiveIntensity:1.5,metalness:.65,roughness:.25});
 const rim=new THREE.MeshBasicMaterial({color:new THREE.Color(.12,1.3,2.8),toneMapped:false});
 const haloMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,toneMapped:false,uniforms:{clock:{value:0}},vertexShader:'varying vec2 local;void main(){local=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 local;uniform float clock;void main(){float r=length(local);float edge=exp(-abs(r-.60)*65.)+exp(-abs(r-.90)*75.);float ticks=pow(max(0.,cos(atan(local.y,local.x)*12.)),12.);float a=(edge*.32+ticks*.08)*(.82+.18*sin(clock*3.));gl_FragColor=vec4(.025,.85,2.4,a);}'});
 const beaconMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,toneMapped:false,uniforms:{clock:{value:0}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 v;uniform float clock;void main(){float fade=pow(max(0.,sin(v.y*3.14159265)),1.4);float ribbon=.55+.45*pow(max(0.,sin(v.x*50.+v.y*9.-clock*2.)),8.);gl_FragColor=vec4(.02,.65,2.0,fade*ribbon*.18);}'});
 let dead=false;
 function spawn(id,x,y,z,guaranteed=false){if(dead||state.collected.has(id)||items.has(id))return;const group=new THREE.Group(),core=new THREE.Mesh(geo,material),ring=new THREE.Mesh(ringGeo,rim),halo=new THREE.Mesh(haloGeo,haloMaterial),beacon=new THREE.Mesh(beaconGeo,beaconMaterial);ring.rotation.x=halo.rotation.x=-Math.PI/2;halo.renderOrder=2;beacon.renderOrder=2;group.add(core,ring,halo,beacon);group.position.set(x,y,z);root.add(group);items.set(id,{id,group,core,ring,halo,beacon,vy:1.5,guaranteed,attracted:false,passed:false});}
 function update(dt,time,player){if(dead)return;dt=Number.isFinite(dt)?Math.max(0,dt):0;time=Number.isFinite(time)?time:0;haloMaterial.uniforms.clock.value=beaconMaterial.uniforms.clock.value=time;const progress=Math.max(0,8-player.z);
  for(let i=0;i<GUARANTEED_REWARDS.length;i++){const distance=GUARANTEED_REWARDS[i],id='relay-'+i;if(distance<progress+65&&distance>progress-120&&state.modules<i+1&&!state.collected.has(id)&&!items.has(id))spawn(id,0,.6,8-distance,true);}
  for(const[id,item]of items){if(item.guaranteed&&id.startsWith('relay-')&&state.modules>=Number(id.slice(6))+1){root.remove(item.group);item.group.clear();items.delete(id);continue;}const p=item.group.position;item.vy-=dt*5;p.y=Math.max(.44,p.y+item.vy*dt);if(p.y<=.44)item.vy=0;item.core.rotation.set(time*1.1,time*1.7,.3);item.ring.rotation.z=time*1.3;const pulse=1+Math.sin(time*3.4)*.055;item.ring.scale.setScalar(pulse);
   const dx=player.x-p.x,dy=player.y-.8-p.y,dz=player.z-p.z,d=Math.hypot(dx,dy,dz),passed=item.guaranteed&&p.z>player.z+5;
   if(passed)item.passed=true;if(d<5.5||passed)item.attracted=true;
   if(item.attracted){const speed=(item.passed?50:8)*(1+Math.max(0,1-d/5.5));p.x+=dx/Math.max(.01,d)*Math.min(d,speed*dt);p.y+=dy/Math.max(.01,d)*Math.min(d,speed*dt);p.z+=dz/Math.max(.01,d)*Math.min(d,speed*dt);}
   item.halo.position.y=.025-p.y;item.beacon.position.y=.825-p.y;
   if(d<1.1){const old=state.level;if(collectModule(state,id))onCollect(item,old,state.level);root.remove(item.group);item.group.clear();items.delete(id);}else if(!item.guaranteed&&p.z-player.z>90){root.remove(item.group);item.group.clear();items.delete(id);}
  }
 }
 function dispose(){if(dead)return;dead=true;root.removeFromParent();geo.dispose();ringGeo.dispose();haloGeo.dispose();beaconGeo.dispose();material.dispose();rim.dispose();haloMaterial.dispose();beaconMaterial.dispose();items.clear();root.clear();}
 return {root,spawn,update,dispose,stats:()=>({active:items.size,ids:[...items.keys()],drawCalls:items.size*4})};
}
