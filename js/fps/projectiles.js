import * as THREE from '../../vendor/three.module.js';

// Logical bullets remain independently mutable. Rendering compacts all visible
// bullets into three shared instance buffers; update() never advances physics.
export function createEnemyProjectiles(scene,quality='high'){
 const capacity=quality==='low'?64:128,root=new THREE.Group();root.name='instanced enemy plasma tracers';scene.add(root);
 const sphere=new THREE.SphereGeometry(1,quality==='low'?6:8,quality==='low'?4:6),tail=new THREE.ConeGeometry(1,1,6);
 const core=new THREE.MeshBasicMaterial({color:new THREE.Color(2.8,1.65,.65),depthWrite:false,toneMapped:false});
 const corona=new THREE.MeshBasicMaterial({color:new THREE.Color(2.2,.045,.015),transparent:true,opacity:.34,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
 const streak=new THREE.MeshBasicMaterial({color:new THREE.Color(2.1,.23,.035),transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
 const cores=new THREE.InstancedMesh(sphere,core,capacity),coronas=new THREE.InstancedMesh(sphere,corona,capacity),tails=new THREE.InstancedMesh(tail,streak,capacity),renderers=[cores,coronas,tails];
 for(const mesh of renderers){mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;mesh.count=0;mesh.visible=false;root.add(mesh);}
 const pool=Array.from({length:capacity},(_,i)=>{const mesh=new THREE.Object3D();mesh.name='logical plasma '+i;mesh.visible=false;return {mesh,life:0,velocity:new THREE.Vector3(),damage:7,shieldVisual:false};});
 const up=new THREE.Vector3(0,1,0),unit=new THREE.Vector3(),tailPosition=new THREE.Vector3(),tailOffset=new THREE.Vector3(),matrix=new THREE.Matrix4();
 const coreScale=new THREE.Vector3(.048,.14,.048),coronaScale=new THREE.Vector3(.13,.34,.13),tailScale=new THREE.Vector3(.055,1.25,.055);
 let disposed=false,active=0,invalid=0,updates=0;
 function orient(b){if(disposed)return;unit.copy(b.velocity);const lengthSq=unit.lengthSq();if(Number.isFinite(lengthSq)&&lengthSq>1e-12)unit.multiplyScalar(1/Math.sqrt(lengthSq));else unit.copy(up);b.mesh.quaternion.setFromUnitVectors(up,unit);b.shieldVisual=false;}
 function update(){if(disposed)return;active=invalid=0;updates++;
  for(let i=0;i<capacity;i++){const b=pool[i];if(!(b.life>0)||!b.mesh.visible)continue;const p=b.mesh.position,q=b.mesh.quaternion;
   if(!Number.isFinite(b.life)||!Number.isFinite(p.x)||!Number.isFinite(p.y)||!Number.isFinite(p.z)||!Number.isFinite(q.x)||!Number.isFinite(q.y)||!Number.isFinite(q.z)||!Number.isFinite(q.w)){invalid++;continue;}
   matrix.compose(p,q,coreScale);cores.setMatrixAt(active,matrix);matrix.compose(p,q,coronaScale);coronas.setMatrixAt(active,matrix);
   tailOffset.set(0,-.68,0).applyQuaternion(q);tailPosition.copy(p).add(tailOffset);matrix.compose(tailPosition,q,tailScale);tails.setMatrixAt(active,matrix);active++;
  }
  for(const mesh of renderers){mesh.count=active;mesh.visible=active>0;mesh.instanceMatrix.needsUpdate=true;}
 }
 function stats(){return {capacity,active,invalid,updates,drawCalls:disposed||!active?0:3,instanced:true};}
 function dispose(){if(disposed)return;disposed=true;active=invalid=0;root.removeFromParent();for(const mesh of renderers)mesh.dispose();sphere.dispose();tail.dispose();core.dispose();corona.dispose();streak.dispose();root.clear();}
 return {pool,orient,update,stats,dispose};
}
