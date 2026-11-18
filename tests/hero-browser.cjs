async function run(page){
 const base=process.env.BASE_URL||'http://127.0.0.1:8765';let checks=0;
 const check=(ok,m)=>{if(!ok)throw new Error(m);checks++;};
 await page.setViewportSize({width:1440,height:900});await page.goto(base+'/');
 check(await page.locator('[data-carousel-ids]').count()===1,'hero slideshow exists');
 check(!await page.evaluate(()=>window.CHICKEN_MENU.some(m=>m.id==='seasonal-hamburg')),'withdrawn menu absent');
 await page.mouse.move(1430,890);const first=await page.locator('.hero').getAttribute('data-feature-id'),start=Date.now();
 await page.waitForFunction(id=>document.querySelector('.hero').dataset.featureId!==id,first,{timeout:3500});
 check(Date.now()-start>=1700,'automatic transition about two seconds');
 async function synced(){return page.locator('.hero').evaluate(e=>{const m=window.CHICKEN_MENU.find(m=>m.id===e.dataset.featureId),img=e.querySelector('[data-feature-image].is-active');return !!m&&e.querySelector('[data-feature-name]').textContent===m.name&&e.querySelector('[data-feature-price]').textContent.includes(m.price.toLocaleString('ja-JP'))&&e.querySelector('[data-feature-link]').getAttribute('href')==='menu.html?id='+m.id&&img.getAttribute('src')===m.image&&img.alt===m.imageAlt;});}
 check(await synced(),'photo title price and destination stay synchronized');
 await page.locator('[data-carousel-toggle]').evaluate(b=>b.click());const paused=await page.locator('.hero').getAttribute('data-feature-id');await page.waitForTimeout(2300);check(await page.locator('.hero').getAttribute('data-feature-id')===paused,'pause stops automatic transitions');
 await page.locator('[data-carousel-next]').evaluate(b=>b.click());await page.waitForFunction(id=>document.querySelector('.hero').dataset.featureId!==id,paused);check(await synced(),'manual next synchronized');
 await page.locator('[data-carousel-toggle]').evaluate(b=>b.click());const resumed=await page.locator('.hero').getAttribute('data-feature-id');await page.waitForFunction(id=>document.querySelector('.hero').dataset.featureId!==id,resumed,{timeout:3500});check(true,'resume restarts automatic transitions');
 await page.goto(base+'/menu.html?id=seasonal-hamburg');check((await page.locator('h1').innerText()).includes('見つかりません'),'withdrawn URL falls back safely');
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/');const reduced=await page.locator('.hero').getAttribute('data-feature-id');await page.waitForTimeout(2300);check(await page.locator('.hero').getAttribute('data-feature-id')===reduced,'reduced motion defaults to paused');
 await page.setViewportSize({width:320,height:850});check(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'mobile slideshow does not overflow');await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/');
 await page.evaluate(()=>{const next=document.querySelector('[data-carousel-next]');next.click();next.click();});
 await page.waitForFunction(()=>document.querySelector('.hero').dataset.featureId==='cube-gratin',{},{timeout:1500});check(true,'rapid next presses advance two dishes');
 await page.locator('[data-carousel-toggle]').click();const focused=await page.locator('.hero').getAttribute('data-feature-id');
 await page.waitForFunction(id=>document.querySelector('.hero').dataset.featureId!==id,focused,{timeout:3500});check(true,'explicit resume works while toggle retains focus');
 const beforeSlow=await page.locator('.hero').getAttribute('data-feature-id');
 await page.evaluate(()=>{const original=HTMLImageElement.prototype.decode;HTMLImageElement.prototype.decode=function(){return new Promise(resolve=>{window.releaseHeroDecode=()=>{HTMLImageElement.prototype.decode=original;resolve();};});};document.querySelector('[data-carousel-next]').click();document.querySelector('.hero').dispatchEvent(new PointerEvent('pointerleave',{pointerType:'mouse'}));window.releaseHeroDecode();});
 await page.waitForFunction(id=>document.querySelector('.hero').dataset.featureId!==id,beforeSlow,{timeout:1500});check(true,'manual selection survives decode and pointer leave');
 return {passed:checks};
}
module.exports=run;
