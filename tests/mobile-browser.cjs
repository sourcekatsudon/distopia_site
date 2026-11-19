// Run in a fresh isolated Playwright context: this suite emulates a coarse pointer.
// It checks behavior and layout, and does not constitute real-phone performance testing.
async function run(page,options={}){
 const base=options.base||'http://127.0.0.1:8765',capture=options.captureDir||'',checks=[],errors=[];
 const check=(ok,label)=>{if(!ok)throw Error(label);checks.push(label);};page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.CHICKEN_DEVELOPMENT=true;
  const original=window.matchMedia.bind(window);window.matchMedia=query=>{const m=original(query);if(query==='(pointer:coarse)')Object.defineProperty(m,'matches',{value:true});return m;};
  Object.defineProperty(navigator,'maxTouchPoints',{configurable:true,value:5});
  localStorage.removeItem('chicken-protocol-quality');localStorage.removeItem('chicken-protocol-auto');
 });
 await page.setViewportSize({width:390,height:844});await page.bringToFront();await page.goto(base+'/?protocol=off');await page.waitForTimeout(400);
 check(await page.locator('main').isVisible(),'mobile ordinary restaurant visible');
 check(!await page.evaluate(()=>performance.getEntriesByType('resource').some(r=>r.name.includes('/fps/')||r.name.includes('/vendor/three'))),'mobile ordinary restaurant does not load FPS');
 check(!await page.evaluate(()=>CHICKEN_PROTOCOL.state().enabled),'mobile automatic horror is initially disabled');
 await page.goto(base+'/?protocol=play&fpsdebug=1');await page.waitForFunction(()=>window.CHICKEN_FPS?.stats().mode==='briefing',null,{timeout:30000});
 check(await page.evaluate(()=>CHICKEN_FPS.stats().touchMode&&CHICKEN_FPS.stats().quality==='low'&&CHICKEN_FPS.stats().presentation==='direct'),'coarse pointer selects playable low/direct FPS');
 await page.locator('.gp-mute').check();await page.locator('.gp-start').click();await page.waitForFunction(()=>!CHICKEN_FPS.stats().paused&&CHICKEN_FPS.stats().mode==='play');
 check(await page.evaluate(()=>document.pointerLockElement===null),'touch start requires no Pointer Lock');
 check(await page.locator('.gp-touch-fire').isVisible()&&await page.locator('.gp-stick').isVisible(),'touch fire and movement controls visible');
 const results=await page.evaluate(()=>{
  const a=CHICKEN_FPS,out=[];const ok=(v,m)=>{if(!v)throw Error(m);out.push(m);};
  const p=(selector,type,id,x=200,y=350)=>document.querySelector(selector).dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',isPrimary:id===1,bubbles:true,cancelable:true,clientX:x,clientY:y}));
  a.restore();p('.gp-touch-charge','pointerdown',1);a.advance(.35);ok(a.stats().player.charge>.2,'touch hold accumulates charge');
  const energy=a.stats().player.energy;p('.gp-touch-charge','pointercancel',1);ok(a.stats().player.charge===0,'touch cancel clears charge');a.advance(.15);ok(a.stats().player.energy===energy,'touch cancel does not fire');
  p('.gp-touch-charge','pointerdown',2);p('.gp-touch-charge','pointerdown',3);a.advance(.25);p('.gp-touch-charge','pointerup',3);const q=a.stats().player.charge;a.advance(.1);ok(a.stats().player.charge>q&&a.stats().player.energy===energy,'second charge finger cannot release owner');
  p('.gp-touch-charge','pointerup',2);ok(a.stats().player.energy<energy,'charge owner release fires');a.advance(.8);a.restore();
  const e=a.stats().player.energy;p('.gp-touch-fire','pointerdown',4);p('.gp-touch-fire','pointerdown',5);p('.gp-touch-fire','pointerup',5);a.advance(.1);ok(a.stats().player.energy<e,'second fire finger cannot release owner');p('.gp-touch-fire','pointerup',4);a.advance(.8);
  a.aimAt(0,1.7,0);const start=a.stats().position,r=document.querySelector('.gp-stick').getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
  p('.gp-stick','pointerdown',6,x,y);p('.gp-stick','pointermove',6,x,y-42);p('.gp-touch-look','pointerdown',7,230,350);p('.gp-touch-look','pointermove',7,330,350);a.advance(.2);const end=a.stats().position;
  ok(end.x>start.x+.1&&end.z<start.z-.3,'simultaneous stick and look change movement direction');p('.gp-stick','pointerup',6);p('.gp-touch-look','pointerup',7);
  p('.gp-touch-reload','pointerdown',8);a.advance(.05);ok(a.stats().player.reload>0,'touch reload begins cell exchange');a.advance(2);ok(a.stats().player.energy===100&&a.stats().player.reload===0,'touch reload refills after lock');
  p('.gp-touch-charge','pointerdown',9);a.advance(.2);p('.gp-touch-pause','pointerdown',10);ok(a.stats().paused&&a.stats().player.charge===0,'touch pause clears held charge');return out;
 });checks.push(...results);
 await page.locator('.gp-start').click();await page.waitForFunction(()=>!CHICKEN_FPS.stats().paused);
 const start=await page.evaluate(()=>CHICKEN_FPS.stats().position);await page.waitForTimeout(100);check(await page.evaluate(p=>{const n=CHICKEN_FPS.stats().position;return Math.hypot(n.x-p.x,n.z-p.z)<.05&&CHICKEN_FPS.stats().player.charge===0;},start),'resume has no stuck movement or charge');
 const fits=()=>page.evaluate(()=>['.gp-stick','.gp-touch-fire','.gp-touch-charge','.gp-touch-pause'].every(s=>{const r=document.querySelector(s).getBoundingClientRect();return r.x>=0&&r.y>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&r.width>=38&&r.height>=38;}));
 check(await fits(),'portrait touch targets stay inside viewport');if(capture)await page.screenshot({path:capture+'/mobile-portrait.png'});
 await page.setViewportSize({width:844,height:390});await page.waitForTimeout(150);check(await fits(),'landscape touch targets stay inside viewport');
 check(await page.evaluate(()=>CHICKEN_FPS.stats().touchMode&&CHICKEN_FPS.stats().rendering.mode==='direct'),'rotation preserves lightweight rendering');if(capture)await page.screenshot({path:capture+'/mobile-landscape.png'});
 await page.locator('.gp-close').click();check(await page.locator('.gp-stage canvas').count()===0&&await page.locator('.gp-touch').count()===0,'mobile exit removes renderer and controls');
 check(await page.locator('main').isVisible()&&await page.evaluate(()=>!document.querySelector('main').inert&&document.body.style.overflow!=='hidden'&&!window.CHICKEN_FPS),'mobile exit restores ordinary site and releases debug state');
 check(!errors.length,'no uncaught mobile errors');return {passed:checks.length,checks,errors,limitation:'Coarse-pointer browser emulation; no real-phone timing claim.'};
}
module.exports=run;
