const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const asURL=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const threeURL=asURL(fs.readFileSync(path.join(root,'vendor/three.module.js'),'utf8'));
const campaignURL=asURL(`export const GUARANTEED_REWARDS=[];export function collectModule(s,id){if(s.collected.has(id))return false;s.collected.add(id);s.modules++;return true;}`);
async function moduleAt(name){return import(asURL(fs.readFileSync(path.join(root,'js/fps',name),'utf8').replace('../../vendor/three.module.js',threeURL).replace('./campaign.js',campaignURL)));}
function inspect(scene){const geos=new Set(),mats=new Set(),instances=new Set();let draws=0;scene.updateMatrixWorld(true);scene.traverse(o=>{for(const n of o.matrixWorld.elements)assert(Number.isFinite(n));if(o.isMesh){draws++;geos.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])mats.add(m);for(const a of Object.values(o.geometry.attributes))for(const v of a.array)assert(Number.isFinite(v));}if(o.isInstancedMesh){instances.add(o);for(const n of o.instanceMatrix.array)assert(Number.isFinite(n));}});return {geos,mats,instances,draws};}
function watch(resources){const calls=new Map();for(const o of [...resources.geos,...resources.mats,...resources.instances]){calls.set(o,0);o.addEventListener('dispose',()=>calls.set(o,calls.get(o)+1));}return ()=>{for(const count of calls.values())assert.equal(count,1,'owned resource disposed exactly once');};}
(async()=>{
 const THREE=await import(threeURL),{createPickupFeedback}=await moduleAt('pickup-feedback.js'),{createPickups}=await moduleAt('pickups.js');
 for(const quality of ['high','low']){
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(78,16/9,.04,220),fx=createPickupFeedback(scene,{quality});camera.position.set(3,1.7,-17);camera.rotation.set(.1,.2,0);
  assert.equal(fx.stats().active,false);fx.trigger({upgrade:false});fx.update(.016,1,camera,{reducedMotion:false});assert.equal(fx.stats().active,true);assert(scene.children[0].position.equals(camera.position));
  const initial=inspect(scene),verify=watch(initial);assert.equal(initial.draws,5);assert.equal(initial.geos.size,3);assert.equal(initial.mats.size,1);assert.equal(initial.instances.size,2);
  for(let i=0;i<600;i++){if(i%20===0)fx.trigger({upgrade:i%40===0});fx.update(1/120,i/120,camera,{reducedMotion:i%2===0});const now=inspect(scene);assert.equal(now.geos.size,initial.geos.size);assert.equal(now.draws,5);for(const geo of now.geos)assert(initial.geos.has(geo));}
  fx.update(NaN,Infinity,camera);inspect(scene);fx.update(.5,10,camera);assert.equal(fx.stats().active,false);assert.equal(scene.children[0].visible,false);assert.equal(fx.stats().duration,.5);assert(fx.stats().triggered>=30);
  fx.dispose();fx.dispose();fx.trigger({upgrade:true});fx.update(.05,0,camera);assert.equal(scene.children.length,0);verify();
 }
 const scene=new THREE.Scene(),state={level:5,modules:240,collected:new Set()},player={x:0,y:1.7,z:8};let calls=0;
 const pickups=createPickups(scene,{state,onCollect:(item,old,next)=>{calls++;assert.equal(old,5);assert.equal(next,5);assert(item.group);}});
 pickups.spawn('drop-enemy-1',0,.6,8,true);pickups.update(.016,0,player);assert.equal(state.modules,241);assert.equal(calls,1);assert.equal(pickups.stats().active,0);
 pickups.spawn('drop-enemy-1',0,.6,8,true);assert.equal(pickups.stats().active,0,'collected IDs cannot duplicate');
 pickups.spawn('relay-0',15,.6,18,true);pickups.update(.016,0,player);assert.equal(pickups.stats().active,0,'relay floor skip is retained');
 pickups.spawn('drop-enemy-2',12,.6,18,true);for(let i=0;i<40&&pickups.stats().active;i++)pickups.update(.05,i*.05,player);assert.equal(calls,2,'guaranteed enemy drop passed-pickup works at LV5');assert.equal(state.modules,242);
 for(let i=0;i<8;i++)pickups.spawn('drop-lifecycle-'+i,i+12,.6,-10,true);const resources=inspect(scene),verify=watch(resources);assert.equal(resources.geos.size,4);assert.equal(resources.mats.size,4);pickups.update(.016,1,player);inspect(scene);pickups.dispose();pickups.dispose();assert.equal(scene.children.length,0);verify();
 console.log('Loot proposal: high/low finite matrices and attributes, five bounded feedback draws, 0.5s expiry, retrigger, reduced motion, LV5 collection, relay-only skip, passed magnet, ID dedupe, exact disposal passed. Shader compile and image quality require browser review.');
})().catch(e=>{console.error(e);process.exitCode=1;});
