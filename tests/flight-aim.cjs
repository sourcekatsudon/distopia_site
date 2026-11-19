const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const data=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
(async()=>{
 const workspace=path.resolve(__dirname,'..');
 const THREE=await import(data(fs.readFileSync(path.join(workspace,'vendor/three.module.js'),'utf8')));
 const simURL=data(fs.readFileSync(path.join(workspace,'js/fps/flight-simulation.js'),'utf8'));
 const sim=await import(simURL);globalThis.__FLIGHT_THREE__=THREE;
 const src=fs.readFileSync(path.join(workspace,'js/fps/space-flight.js'),'utf8')
  .replace("import * as THREE from '../../vendor/three.module.js';",'const THREE=globalThis.__FLIGHT_THREE__;')
  .replace("from './flight-simulation.js'","from '"+simURL+"'");
 const {createSpaceFlight}=await import(data(src));
 let geometryCalls=0,materialCalls=0;const originalGeometryDispose=THREE.BufferGeometry.prototype.dispose,originalMaterialDispose=THREE.Material.prototype.dispose;
 THREE.BufferGeometry.prototype.dispose=function(){geometryCalls++;return originalGeometryDispose.call(this);};
 THREE.Material.prototype.dispose=function(){materialCalls++;return originalMaterialDispose.call(this);};
 const {createFlightState,advanceFlightTimeline,stepFlightMotion,FLIGHT_CONFIG}=sim;
 assert.equal(FLIGHT_CONFIG.duration,30);assert.equal(FLIGHT_CONFIG.warpSeconds,4);
 const timeline=createFlightState();assert.equal(timeline.duration,30);
 timeline.elapsed=29.999;assert.equal(advanceFlightTimeline(timeline),null);
 timeline.elapsed=30;assert.equal(advanceFlightTimeline(timeline),'warp');
 timeline.elapsed=33.999;assert.equal(advanceFlightTimeline(timeline),null);
 timeline.elapsed=34;assert.equal(advanceFlightTimeline(timeline),'complete');
 const custom=createFlightState({duration:60});custom.elapsed=60;assert.equal(advanceFlightTimeline(custom),'warp');custom.elapsed=64;assert.equal(advanceFlightTimeline(custom),'complete');
 const invalid=createFlightState({duration:NaN});stepFlightMotion(invalid,NaN,{x:Infinity,y:NaN});assert.equal(invalid.duration,30);assert.ok(Number.isFinite(invalid.x));
 const logs=[];
 for(const quality of ['low','high']){
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(78,1.6,.04,220);
  camera.position.set(4,1.7,8);camera.rotation.set(.1,.3,0);
  scene.background=new THREE.Color(0x07111a);scene.fog=new THREE.FogExp2(0x07111a,.022);
  const saved={pos:camera.position.toArray(),quat:camera.quaternion.toArray(),fov:camera.fov,bg:scene.background,fog:scene.fog};
  let completions=0,failures=0;const events=[];
  const f=createSpaceFlight({scene,camera,quality,level:5,onComplete:()=>completions++,onFailure:()=>failures++,onEvent:e=>events.push({type:e.type,elapsed:f.stats().elapsed})});
  // Real rendered projectile directions, not merely the reported aim target.
  f.update(.05,.05,{aimX:.47,aimY:.31,fire:true,reducedMotion:true});
  assert.equal(f.stats().x,0);assert.equal(f.stats().y,0,'Cursor must not move ship');
  const bolts=f.root.getObjectByName('ASCENSION player cannon projectiles');
  const matrix=new THREE.Matrix4(),point=new THREE.Vector3(),direction=new THREE.Vector3(),intersection=new THREE.Vector3();
  for(let i=0;i<2;i++){
   matrix.fromArray(bolts.instanceMatrix.array,i*16);point.setFromMatrixPosition(matrix);
   direction.set(0,1,0).transformDirection(matrix);
   intersection.copy(point).addScaledVector(direction,(-80-point.z)/direction.z).project(camera);
   assert.ok(Math.abs(intersection.x-.47)<2e-5,'Actual beam must cross cursor X');
   assert.ok(Math.abs(intersection.y-.31)<2e-5,'Actual beam must cross cursor Y');
  }
  f.update(.05,.1,{x:.5,y:.4,aimX:-5,aimY:3});
  assert.ok(f.stats().x>0&&f.stats().y>0,'WASD independently moves ship');assert.equal(f.stats().aim.x,-1);assert.equal(f.stats().aim.y,1);
  for(let i=2;i<750;i++){
   const t=i*.05;f.update(.05,t,{x:Math.sin(t*1.25)*.7,y:Math.cos(t*1.45)*.75,fire:true});
   assert.ok(Number.isFinite(f.stats().distance));
   if(f.stats().phase==='complete'||f.stats().phase==='failed')break;
  }
  assert.equal(f.stats().phase,'complete');assert.equal(f.stats().elapsed,34);assert.equal(completions,1);assert.equal(failures,0);
  assert.equal(events.filter(e=>e.type==='warp').length,1);assert.equal(events.filter(e=>e.type==='target-lost').length,1);assert.equal(events.filter(e=>e.type==='complete').length,1);
  assert.ok(events.find(e=>e.type==='warp').elapsed>=30&&events.find(e=>e.type==='warp').elapsed<30.051);
  assert.ok(events.find(e=>e.type==='target-lost').elapsed>=32.8);
  let geo=0,mat=0,inst=0;const gs=new Set(),ms=new Set();
  f.root.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);if(o.isInstancedMesh)o.addEventListener('dispose',()=>inst++);if(o.geometry?.attributes.position)for(const n of o.geometry.attributes.position.array)assert.ok(Number.isFinite(n));});
  for(const g of gs)g.addEventListener('dispose',()=>geo++);for(const m of ms)m.addEventListener('dispose',()=>mat++);
  const resources=f.stats().resourceCounts;logs.push({quality,elapsed:f.stats().elapsed,kills:f.stats().kills,hits:f.stats().hits});
  const beforeG=geometryCalls,beforeM=materialCalls;f.dispose();assert.equal(geometryCalls-beforeG,resources.geometries);assert.equal(materialCalls-beforeM,resources.materials);assert.equal(geo,gs.size);assert.equal(mat,ms.size);assert.equal(inst,resources.instanced);const once=[geo,mat,inst];f.dispose();assert.deepEqual([geo,mat,inst],once);
  assert.equal(scene.children.length,0);assert.deepEqual(camera.position.toArray(),saved.pos);assert.deepEqual(camera.quaternion.toArray(),saved.quat);assert.equal(camera.fov,saved.fov);assert.equal(scene.background,saved.bg);assert.equal(scene.fog,saved.fog);
  // Cursor tracking must damage real collision bodies and produce real kills.
  const tracking=createSpaceFlight({scene,camera,quality,level:5,duration:60});
  const hulls=tracking.root.getObjectByName('ASCENSION enemy hulls');let nearAim=false;
  for(let i=0;i<400;i++){
   let best=-Infinity,target=null;
   for(let n=0;n<hulls.count;n++){
    matrix.fromArray(hulls.instanceMatrix.array,n*16);if(Math.abs(matrix.determinant())<.0001)continue;
    point.setFromMatrixPosition(matrix);if(point.z<-5&&point.z>best){best=point.z;target=point.clone();}
   }
   const projected=target?.project(camera);
   tracking.update(.05,i*.05,{aimX:projected?.x??0,aimY:projected?.y??0,fire:!!target&&best>-55,reducedMotion:true});if(target&&best>-55&&tracking.stats().aim.target.z>-65)nearAim=true;
  }
  assert.ok(nearAim,'Close target under cursor sets real convergence depth rather than a fixed distant plane');
  assert.ok(tracking.stats().kills>0,'Cursor-aimed projectiles must kill actual enemies');logs.push({quality,cursorKills:tracking.stats().kills});tracking.dispose();
  const failed=createSpaceFlight({scene,camera,quality,level:1,duration:60,onFailure:()=>failures++});
  for(let i=0;i<1300&&failed.stats().phase==='flight';i++)failed.update(.05,i*.05,{x:0,y:0,fire:false});
  assert.equal(failed.stats().phase,'failed','Stationary pilot can still fail from real projectiles');assert.equal(failures,1);failed.update(1,1000,{});assert.equal(failures,1);failed.dispose();
 }
 THREE.BufferGeometry.prototype.dispose=originalGeometryDispose;THREE.Material.prototype.dispose=originalMaterialDispose;delete globalThis.__FLIGHT_THREE__;
 console.log(JSON.stringify({passed:true,checks:logs},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
