import * as THREE from '../../vendor/three.module.js';
export function createEffects(scene,quality='high'){
 const root=new THREE.Group();scene.add(root);const cap=quality==='low'?220:640,states=Array.from({length:cap},()=>({life:0,x:0,y:0,z:0,vx:0,vy:0,vz:0,max:1}));let cursor=0;
 const particleGeo=new THREE.OctahedronGeometry(.055,0),particleMat=new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false});const particles=new THREE.InstancedMesh(particleGeo,particleMat,cap);particles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);particles.frustumCulled=false;root.add(particles);
 const dummy=new THREE.Object3D(),color=new THREE.Color(),up=new THREE.Vector3(0,1,0),direction=new THREE.Vector3();
 for(let i=0;i<cap;i++){dummy.scale.setScalar(0);dummy.updateMatrix();particles.setMatrixAt(i,dummy.matrix);particles.setColorAt(i,color.setHex(0xff9944));}
 const beamGeo=new THREE.CylinderGeometry(1,1,1,10,1,true),beamMats=[new THREE.MeshBasicMaterial({color:0x17cfff,transparent:true,opacity:.44,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}),new THREE.MeshBasicMaterial({color:0xd9ffff,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false})];
 const beams=Array.from({length:24},()=>{const group=new THREE.Group();group.visible=false;root.add(group);for(const mat of beamMats)group.add(new THREE.Mesh(beamGeo,mat));return {group,life:0,max:.18};});let beamCursor=0;
 const ringGeo=new THREE.TorusGeometry(1,.025,5,40),ringMat=new THREE.MeshBasicMaterial({color:0x35cbff,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
 const rings=Array.from({length:8},()=>{const mesh=new THREE.Mesh(ringGeo,ringMat);mesh.visible=false;root.add(mesh);return {mesh,life:0};});let ringCursor=0;
 function sparks(pos,count,power=1,tint=0xff9944){for(let i=0;i<count;i++){const s=states[cursor];s.life=.3+Math.random()*.7;s.max=s.life;s.x=pos.x;s.y=pos.y;s.z=pos.z;s.vx=(Math.random()-.5)*power*9;s.vy=(Math.random()*.8+.2)*power*7;s.vz=(Math.random()-.5)*power*9;particles.setColorAt(cursor,color.setHex(tint));cursor=(cursor+1)%cap;}particles.instanceColor.needsUpdate=true;}
 function beam(start,end,power=1){const b=beams[beamCursor++%beams.length],len=start.distanceTo(end);b.life=.16+power*.025;b.max=b.life;b.group.visible=true;b.group.position.copy(start).lerp(end,.5);direction.subVectors(end,start).normalize();b.group.quaternion.setFromUnitVectors(up,direction);b.group.children[0].scale.set(.055*power,len,.055*power);b.group.children[1].scale.set(.013*power,len,.013*power);}
 function impact(pos,dir,power=1){sparks(pos,Math.floor(16*power),power,0x5de7ff);}
 function explode(pos,power=1){sparks(pos,Math.min(100,Math.floor(42*power)),power,0xffa34e);sparks(pos,Math.floor(18*power),power,0x42ddff);const r=rings[ringCursor++%rings.length];r.life=.55;r.mesh.visible=true;r.mesh.position.copy(pos);r.mesh.rotation.set(Math.PI/2,0,0);}
 function update(dt,time){for(let i=0;i<cap;i++){const s=states[i];if(s.life>0){s.life-=dt;s.vy-=dt*7;s.x+=s.vx*dt;s.y+=s.vy*dt;s.z+=s.vz*dt;if(s.y<.03){s.y=.03;s.vy=Math.abs(s.vy)*.25;s.vx*=.85;s.vz*=.85;}dummy.position.set(s.x,s.y,s.z);dummy.rotation.set(time*3+i,time+i*2,time*5);dummy.scale.setScalar(Math.max(0,s.life/s.max));}else dummy.scale.setScalar(0);dummy.updateMatrix();particles.setMatrixAt(i,dummy.matrix);}particles.instanceMatrix.needsUpdate=true;
  for(const b of beams)if(b.life>0){b.life-=dt;b.group.visible=b.life>0;b.group.scale.set(1,1,Math.max(.1,b.life/b.max));}
  for(const r of rings)if(r.life>0){r.life-=dt;r.mesh.visible=r.life>0;r.mesh.scale.setScalar((.55-r.life)*9+.1);}
 }
 function dispose(){scene.remove(root);particleGeo.dispose();particleMat.dispose();beamGeo.dispose();beamMats.forEach(m=>m.dispose());ringGeo.dispose();ringMat.dispose();particles.dispose();root.clear();}
 return {beam,impact,explode,update,dispose,root,stats:()=>({particles:states.filter(s=>s.life>0).length,beams:beams.filter(s=>s.life>0).length})};
}
