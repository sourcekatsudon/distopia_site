const assert=require('node:assert/strict');
(async()=>{
 const s=await import('data:text/javascript;base64,'+require('node:fs').readFileSync(require('node:path').join(__dirname,'../js/fps/simulation.js')).toString('base64'));
 const a=s.seededRandom(731),b=s.seededRandom(731);for(let i=0;i<50;i++)assert.equal(a(),b());
 const wall={minX:1,maxX:1.2,minZ:-5,maxZ:5,minY:0,maxY:4,enabled:true};
 let p=s.movePlayer({x:0,z:0,y:1.7},10,0,[wall]);assert.ok(p.x<=.61,'No tunneling through thin wall');
 wall.enabled=false;p=s.movePlayer({x:0,z:0,y:1.7},10,0,[wall]);assert.ok(p.x>9.9,'Open door passable');wall.enabled=true;
 assert.equal(s.hasSight({x:0,z:0},{x:3,z:0},[wall]),false);
 assert.equal(s.hasSight({x:0,z:0},{x:-3,z:0},[wall]),true);
 assert.deepEqual(s.findPath([{x:0,z:0,links:[1]},{x:0,z:2,links:[0,2]},{x:2,z:2,links:[1]}],0,2),[0,1,2]);
 const state=s.createPlayer();s.applyDamage(state,40);assert.equal(state.shield,110);assert.equal(state.hp,100);s.applyDamage(state,200);assert.equal(state.hp,10);
 assert.ok(s.weaponShot(1).damage>s.weaponShot(0).damage*3);assert.ok(s.weaponShot(0).cost<10);
 assert.equal(s.groundHeight(-14,-37),1);assert.equal(s.groundHeight(-14,-50),2);assert.equal(s.groundHeight(0,-50),0);
 assert.equal(s.zoneAt(8),0);assert.equal(s.zoneAt(-35),2);assert.equal(s.zoneAt(-99),4);
 const run=s.createProgress();assert.equal(s.gateReady(run,0),false);run.stages[0].spawned=run.stages[0].total;run.stages[0].kills=run.stages[0].total;assert.equal(s.gateReady(run,0),true);
 const enemy={type:'soldier',x:0,z:-8,state:'IDLE',hp:100,cooldown:0,phase:1,age:0,stagger:0};
 const events=s.stepEnemy(enemy,{x:0,z:0,hp:100},.5,{colliders:[],nodes:[],time:1});assert.notEqual(enemy.state,'IDLE');assert.ok(Array.isArray(events));
 console.log('FPS simulation: seeded random, collision/no tunneling, doors, occlusion, navigation, damage, charge, zones, progress and AI passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
