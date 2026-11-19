const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
(async()=>{
 const base=path.resolve(__dirname,'..'),dir=path.join(base,'js/fps'),threeURL=pathToFileURL(path.join(base,'vendor/three.module.js')).href,THREE=await import(threeURL);
 const data=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
 const ctx=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}});
 global.document={createElement:()=>({width:0,height:0,getContext:()=>ctx})};
 const read=p=>fs.readFileSync(p,'utf8'),kitURL=data(read(path.join(base,'js/fps/material-kit.js')).replace("'../../vendor/three.module.js'",JSON.stringify(threeURL))),fxURL=data(read(path.join(base,'js/fps/railgun-energy-fx.js')).replace("'../../vendor/three.module.js'",JSON.stringify(threeURL)));
 const railURL=data(read(path.join(base,'js/fps/weapon.js')).replace("'../../vendor/three.module.js'",JSON.stringify(threeURL)).replace("'./material-kit.js'",JSON.stringify(kitURL)).replace("'./railgun-energy-fx.js'",JSON.stringify(fxURL)));
 const defsURL=data(read(path.join(dir,'weapon-defs.js'))),compactURL=data(read(path.join(dir,'compact-weapons.js')).replace("'../../vendor/three.module.js'",JSON.stringify(threeURL)).replace("'./material-kit.js'",JSON.stringify(kitURL)).replace("'./weapon-defs.js'",JSON.stringify(defsURL)));
 const armoryURL=data(read(path.join(dir,'armory.js')).replace("'../../vendor/three.module.js'",JSON.stringify(threeURL)).replace("'./weapon.js'",JSON.stringify(railURL)).replace("'./compact-weapons.js'",JSON.stringify(compactURL)).replace("'./weapon-defs.js'",JSON.stringify(defsURL)));
 const{WEAPON_LEVELS,weaponDefinition,shotFor}=await import(defsURL),{createWeaponModel}=await import(armoryURL),{createSurfaceKit}=await import(kitURL);
 assert.equal(WEAPON_LEVELS.length,6);assert.equal(weaponDefinition(NaN).level,1);assert.equal(weaponDefinition(88).level,5);
 for(const level of[1,2]){const shot=shotFor(level,1);assert.equal(shot.cost,1);assert.equal(shot.damage,WEAPON_LEVELS[level].damage);assert.equal(shot.pierce,1);}
 assert.equal(shotFor(3,1).damage,170);assert.equal(shotFor(3,1).cost,35);assert.equal(shotFor(3,1).pierce,3);assert(shotFor(5,1).damage>shotFor(4,1).damage);assert.equal(shotFor(5,1).chain,4);
 const results=[];
 for(const quality of['low','high']){const lease=createSurfaceKit({quality});
  for(let level=1;level<=5;level++){const w=createWeaponModel(level,{quality}),d=WEAPON_LEVELS[level],gs=new Set(),ms=new Set();let meshes=0,triangles=0,instanced=0;
   w.root.traverse(o=>{if(o.geometry){gs.add(o.geometry);if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}for(const v of o.geometry.attributes.position.array)assert(Number.isFinite(v));}if(o.material)ms.add(o.material);if(o.isInstancedMesh)instanced++;});
   w.update(0,{time:1,energy:d.capacity/2,reducedMotion:true});assert.equal(w.inspect().level,level);assert.equal(w.inspect().capacity,d.capacity);assert.equal(w.inspect().glyphs,level<3?(level===1?3:6):4);
   const motion=w.inspect().breathPosition;w.update(.1,{time:5,energy:d.capacity/2,reducedMotion:true});assert.deepEqual(w.inspect().breathPosition,motion);
   w.prepare();for(let i=0;i<120;i++){if(i===15)w.fire(3);const reloading=i>40&&i<100;w.update(1/60,{time:i/60,energy:d.capacity/2,charge:i<15?1:0,reload:reloading?(i-40)/60:-1,deploy:1});w.root.updateMatrixWorld(true);w.root.traverse(o=>{for(const v of o.matrixWorld.elements)assert(Number.isFinite(v));if(o.geometry)for(const v of o.geometry.attributes.position.array)assert(Number.isFinite(v));if(o.isInstancedMesh)for(const v of o.instanceMatrix.array)assert(Number.isFinite(v));});}
   const gs2=new Set(),ms2=new Set();w.root.traverse(o=>{if(o.geometry)gs2.add(o.geometry);if(o.material)ms2.add(o.material);});assert.equal(gs.size,gs2.size);assert.equal(ms.size,ms2.size);
   w.update(.1,{time:3,energy:0,reload:.4});assert.equal(w.inspect().glyphs,0);if(level<3)assert.equal(w.inspect().state,'RELOADING');if(level>3){assert.equal(w.inspect().evolution.totalReactors,level===4?2:3);assert.equal(w.inspect().evolution.limiterInstances,level===4?6:12);}
   let gd=0,md=0,id=0;for(const g of gs)g.addEventListener('dispose',()=>gd++);for(const m of ms)m.addEventListener('dispose',()=>md++);w.root.traverse(o=>{if(o.isInstancedMesh)o.addEventListener('dispose',()=>id++);});w.dispose();const once=[gd,md,id];w.dispose();assert.deepEqual([gd,md,id],once);assert.equal(id,instanced);w.update(.1,{time:4});w.fire(1);
   results.push({level,quality,meshes,triangles,instanced,disposedGeometry:gd,disposedMaterials:md});
  }lease.dispose();}
 console.log(JSON.stringify({pass:true,checks:'5 levels x 2 presets; data/capacity normalization; finite geometry/matrices; state/reload; no new GPU objects during update; exact-once instance disposal',results},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
