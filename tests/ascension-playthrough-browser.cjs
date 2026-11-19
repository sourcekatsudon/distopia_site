// Real game physics/AI, deterministic 12s encounter observation cadence, no health cheats.
// Captures timed progression; not a human skill/median completion-time estimate.
async function run(page,{base='http://127.0.0.1:8765',limit=1800}={}){
 await page.goto(base+'/?protocol=quick&fpsdebug=1');await page.waitForFunction(()=>window.CHICKEN_FPS?.newRun);await page.locator('.gp-mute').check();
 return await page.evaluate(async limit=>{const a=CHICKEN_FPS,{hasSight}=await import('/js/fps/simulation.js'),{SEGMENTS,HANGAR_Z}=await import('/js/fps/campaign-layout.js');a.newRun();a.seed(731);await a.resume();const route=a.world().route,keys=new Set(),observed=new Set(),segments=[],deaths=[];let point=1,wait=0,charge=false,chargeStart=0,lastProgress=0,stuck=0,recoverTo=null,recoveries=0;
 const key=(code,on)=>{if(on&&!keys.has(code)){keys.add(code);document.dispatchEvent(new KeyboardEvent('keydown',{code}));}if(!on&&keys.has(code)){keys.delete(code);document.dispatchEvent(new KeyboardEvent('keyup',{code}));}};
 const mouse=(button,on)=>{(on?document.querySelector('.gp-stage canvas'):document).dispatchEvent(new MouseEvent(on?'mousedown':'mouseup',{button,bubbles:true}));};
 for(let t=0;t<limit;t+=.1){let s=a.stats();if(s.mode==='dead'){deaths.push({time:s.progress.elapsed,checkpoint:s.progress.checkpoint.index,...s.progress.stats.deathLog.at(-1)});if(deaths.length>20)break;a.retry();await a.resume();charge=false;keys.clear();point=route.findIndex(p=>p[1]<a.stats().player.z-1);if(point<0)point=route.length-1;wait=0;s=a.stats();}
  const p=s.player,segment=Math.min(SEGMENTS.length-1,Math.max(0,Math.floor((8-p.z)/80))),distance=8-p.z;
  if(distance>=segment*80+14&&!observed.has(segment)){observed.add(segment);wait=12;segments.push({segment,time:s.progress.elapsed,hp:p.hp,level:s.progress.level,modules:s.progress.modules});}
  const world=a.world(),es=a.enemies().filter(e=>e.arrival<=0&&e.hp>0&&hasSight({x:p.x,y:1.7,z:p.z},{x:e.x,y:1.7,z:e.z},world.colliders)).sort((x,y)=>Math.hypot(x.x-p.x,x.z-p.z)-Math.hypot(y.x-p.x,y.z-p.z)),e=es[0];
  while(!recoverTo&&point<route.length-1&&Math.hypot(route[point][0]-p.x,route[point][1]-p.z)<.45)point++;
  if(recoverTo&&Math.hypot(recoverTo[0]-p.x,recoverTo[1]-p.z)<.6){recoverTo=null;stuck=0;}const goal=recoverTo||route[point],tx=e?.x??goal[0],tz=e?.z??goal[1],ty=e?(e.type==='drone'?1.65:e.type==='heavy'?3.17:e.type==='turret'?1.49:2.20):1.7;a.aimAt(tx,ty,tz);
  const yaw=Math.atan2(-(tx-p.x),-(tz-p.z)),vx=goal[0]-p.x,vz=goal[1]-p.z,l=Math.hypot(vx,vz)||1,forward=(-Math.sin(yaw)*vx-Math.cos(yaw)*vz)/l,side=(Math.cos(yaw)*vx-Math.sin(yaw)*vz)/l,moving=wait<=0;
  key('KeyW',moving&&forward>.25);key('KeyS',moving&&forward<-.25);key('KeyD',moving&&side>.25);key('KeyA',moving&&side<-.25);
  // Timed retreat along the prior path while exchanging a cell, not invulnerability.
  if(p.reload>0&&wait>0){key('KeyS',true);key('KeyA',Math.floor(t)%2===0);}
  if(e&&s.progress.level>=3&&['heavy','guardian','turret'].includes(e.type)&&p.reload===0){mouse(0,false);if(!charge&&p.cooldown<=0){mouse(2,true);charge=true;chargeStart=t;}if(charge&&t-chargeStart>=.95){mouse(2,false);charge=false;}}
  else{if(charge){mouse(2,false);charge=false;}mouse(0,!!e);}
  if(p.energy<=(s.progress.level<3?3:10)&&p.reload===0)a.reload();a.interact();a.simulate(.1);wait=Math.max(0,wait-.1);if(t%2<.05)a.render();
  if(p.z<HANGAR_Z+8){mouse(0,false);mouse(2,false);a.board();a.pause();return{groundComplete:true,recoveries,groundTime:a.stats().progress.elapsed,progress:a.stats().progress,deaths,segments,player:a.stats().player};}
  if(Math.abs(distance-lastProgress)<.001&&wait===0)stuck+=.1;else stuck=0;if(stuck>1.5&&!recoverTo){recoverTo=route[Math.max(0,point-1)];recoveries++;stuck=0;}if(stuck>15)break;lastProgress=distance;
 }
 for(const k of keys)key(k,false);mouse(0,false);mouse(2,false);a.pause();return{groundComplete:false,recoveries,progress:a.stats().progress,deaths,segments,player:a.stats().player,point,goal:route[point],stuck};},limit);
}
module.exports={run};
