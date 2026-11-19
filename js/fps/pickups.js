import * as THREE from '../../vendor/three.module.js';
import {GUARANTEED_REWARDS,collectModule} from './campaign.js';
export function createPickups(scene,{state,onCollect=()=>{}}){
 const root=new THREE.Group();root.name='stable upgrade module rewards';scene.add(root);const items=new Map(),geo=new THREE.OctahedronGeometry(.18,0),ringGeo=new THREE.TorusGeometry(.25,.018,4,16),material=new THREE.MeshStandardMaterial({color:0x0d314e,emissive:0x159dff,emissiveIntensity:1.8,metalness:.65,roughness:.25}),rim=new THREE.MeshBasicMaterial({color:0x4cd7ff,toneMapped:false});let dead=false;
 function spawn(id,x,y,z,guaranteed=false){if(state.collected.has(id)||items.has(id))return;const group=new THREE.Group(),core=new THREE.Mesh(geo,material),ring=new THREE.Mesh(ringGeo,rim);ring.rotation.x=Math.PI/2;group.add(core,ring);group.position.set(x,y,z);root.add(group);items.set(id,{id,group,core,ring,vy:1.5,guaranteed});}
 function update(dt,time,player){const progress=Math.max(0,8-player.z);
  for(let i=0;i<GUARANTEED_REWARDS.length;i++){const distance=GUARANTEED_REWARDS[i],id='relay-'+i;if(distance<progress+65&&distance>progress-120&&state.modules<i+1&&!state.collected.has(id)&&!items.has(id))spawn(id,0,.6,8-distance,true);}
  for(const[id,item]of items){if(item.guaranteed&&state.modules>=Number(id.slice(6))+1){root.remove(item.group);item.group.clear();items.delete(id);continue;}const p=item.group.position;item.vy-=dt*5;p.y=Math.max(.30,p.y+item.vy*dt);if(p.y<=.3)item.vy=0;item.core.rotation.set(time*1.1,time*1.7,.3);item.ring.rotation.z=time*1.3;
   const dx=player.x-p.x,dy=player.y-.8-p.y,dz=player.z-p.z,d=Math.hypot(dx,dy,dz),passed=item.guaranteed&&p.z>player.z+5;
   if(d<5.5||passed){const speed=(passed?50:8)*(1+Math.max(0,1-d/5.5));p.x+=dx/Math.max(.01,d)*Math.min(d,speed*dt);p.y+=dy/Math.max(.01,d)*Math.min(d,speed*dt);p.z+=dz/Math.max(.01,d)*Math.min(d,speed*dt);}
   if(d<1.1){const old=state.level;if(collectModule(state,id))onCollect(item,old,state.level);root.remove(item.group);item.group.clear();items.delete(id);}else if(!item.guaranteed&&p.z-player.z>90){root.remove(item.group);item.group.clear();items.delete(id);}
  }
 }
 function dispose(){if(dead)return;dead=true;root.removeFromParent();geo.dispose();ringGeo.dispose();material.dispose();rim.dispose();items.clear();root.clear();}
 return {root,spawn,update,dispose,stats:()=>({active:items.size,ids:[...items.keys()]})};
}
