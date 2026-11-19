const assert=require('node:assert/strict'),load=require('./load-module.cjs');
(async()=>{
 const m=await load(__dirname+'/../js/fps/campaign-layout.js'),sim=await load(__dirname+'/../js/fps/simulation.js'),c=await load(__dirname+'/../js/fps/campaign.js');
 assert.equal(m.SEGMENT_COUNT,4,'campaign contains exactly A B C D');
 assert(m.ROUTE_LENGTH<400,'ground route fits four short sectors');
 const a=m.createCampaignLayout(731),b=m.createCampaignLayout(732);assert.equal(JSON.stringify(a.route),JSON.stringify(m.createCampaignLayout(731).route),'retry keeps the same route');assert.notEqual(JSON.stringify(a.route),JSON.stringify(b.route),'fresh seed changes bends');
 assert.deepEqual(a.segments.map(s=>s.letter),['A','B','C','D']);assert.equal(new Set(a.segments.map(s=>s.kind)).size,4,'four different environments');
 for(let seed=0;seed<100;seed++){
  const map=m.createCampaignLayout(seed),layouts=map.segments.map(s=>map.segmentLayout(s.index)),boxes=layouts.flatMap(l=>[...l.staticBoxes,...l.destructibles.map(d=>d.collider)]);
  for(let i=1;i<map.route.length;i++){const from=map.route[i-1],to=map.route[i],n=Math.ceil(Math.hypot(to[0]-from[0],to[1]-from[1])/.2);for(let k=0;k<=n;k++){const t=k/n,x=from[0]+(to[0]-from[0])*t,z=from[1]+(to[1]-from[1])*t;assert(!sim.circleBlocked(x,z,1.7,boxes,.9),`seed ${seed} blocks route ${i} at ${x},${z}`);}}
  for(const l of layouts)for(const e of l.entries)assert(!sim.circleBlocked(e.x,e.z-1.5,1.7,boxes,.95),`seed ${seed} blocked entry ${e.id}`);
 }
 const s=c.createCampaign({seed:731});assert.equal(s.layoutSeed,731);const encounters=Array.from({length:4},(_,i)=>c.encounterFor(i));assert(encounters.every(e=>e.enemies.length>=16&&!e.rear),'each sector has a forward encounter');assert.equal(c.encounterFor(4).enemies.length,0);assert.equal(encounters.reduce((n,e)=>n+e.enemies.length,0),c.CAMPAIGN_CONFIG.enemyCount);assert(c.LEVEL_THRESHOLDS[4]<=45,'LV5 is attainable in short campaign');
 console.log('A–D: 100 seeds, varied profiles, reproducible retries, swept route and spawn clearance, short growth passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
