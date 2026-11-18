// Optional browser regression suite. Run with Playwright available: node tests/browser.cjs
// The exported function also runs against a Playwright MCP page without a local dependency.
async function run(page) {
 const base=process.env.BASE_URL||'http://127.0.0.1:8765';
 const checks=[],errors=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failed.push(r.status()+' '+r.url());});
 const check=(ok,m)=>{if(!ok)throw new Error(m);checks.push(m);};
 await page.goto(base+'/');
 // No pause between input and category click: catches a lost debounced query.
 const rapid=await page.evaluate(()=>{const i=document.getElementById('menu-search');i.value='カツ';i.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('[data-category=rice]').click();return {q:i.value,n:document.querySelectorAll('#menu-grid .menu-card').length};});
 check(rapid.q==='カツ'&&rapid.n===1,'immediate category switch preserves pending search');
 await page.goto(base+'/');
 const menu=await page.evaluate(()=>window.CHICKEN_MENU);
 check(await page.locator('#menu-grid .menu-card').count()===12,'initial 12');
 await page.locator('#menu-more').click();check(await page.locator('#menu-grid .menu-card').count()===24,'load24');
 await page.locator('#menu-search').dispatchEvent('input');await page.waitForTimeout(220);check(await page.locator('#menu-grid .menu-card').count()===24,'unchanged query preserves expanded list');
 await page.evaluate(()=>dispatchEvent(new PopStateEvent('popstate')));check(await page.locator('#menu-grid .menu-card').count()===24,'same-state history preserves expanded list');
 await page.locator('#menu-more').click();check(await page.locator('#menu-grid .menu-card').count()===32,'load32');
 check(await page.locator('#menu-more').isHidden(),'hide exhausted more');
 for(const [c,n] of Object.entries({recommended:6,grill:9,pasta:4,rice:5,side:5,japanese:2,dessert:6,takeout:12})){
  await page.locator('[data-category='+c+']').click();check(await page.locator('#menu-grid .menu-card').count()===n,'category '+c);
 }
 await page.locator('[data-category=all]').click();await page.locator('#menu-search').fill('結果なしXYZ');await page.waitForTimeout(220);
 check(await page.locator('.menu-empty').count()===1,'empty search');await page.locator('#menu-reset').click();check(await page.locator('#menu-grid .menu-card').count()===12,'clear search');
 await page.goto(base+'/?category=rice&q='+encodeURIComponent('カツ')+'#menu');check(await page.locator('#menu-grid .menu-card').count()===1,'URL restores search');
 await page.locator('#menu-grid a').click();check((await page.locator('h1').innerText()).includes('カツ'),'card detail navigation');await page.goBack();check(await page.locator('#menu-grid .menu-card').count()===1,'history restores query');
 for(const m of menu){
  await page.goto(base+'/menu.html?id='+m.id);
  check(await page.locator('h1').innerText()===m.name,m.id+' title');
  check((await page.locator('.detail-meta').innerText()).includes(m.price.toLocaleString('ja-JP')),m.id+' price');
  await page.locator('#detail-main-image').evaluate(img=>img.decode());check(await page.locator('#detail-main-image').getAttribute('src')===m.image,m.id+' image');
  check(await page.locator('.back-link').getAttribute('href')==='index.html#menu',m.id+' back');
 }
 await page.goto(base+'/menu.html?id=cube-parfait');await page.locator('.gallery-thumb').nth(2).click();check((await page.locator('#detail-main-image').getAttribute('src')).includes('-2.webp'),'gallery switches');check(await page.locator('.gallery-thumb[aria-pressed=true]').count()===1,'one selected photo');
 await page.goto(base+'/menu.html?id=unknown');check((await page.locator('h1').innerText()).includes('見つかりません'),'unknown product fallback');check(await page.locator('.related-section').isHidden(),'invalid product hides related');
 await page.goto(base+'/?category=unknown');check(await page.locator('#menu-grid .menu-card').count()===12,'unknown category fallback');
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});await page.goto(base+'/');
  for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=700)await page.evaluate(y=>scrollTo(0,y),y);
  await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
  check(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'no overflow '+width);
  if(width===390){await page.locator('.menu-toggle').click();check(await page.locator('#site-nav').isVisible(),'mobile nav opens');await page.locator('#site-nav a').first().focus();await page.keyboard.press('Escape');check(!await page.locator('#site-nav').isVisible(),'mobile nav Escape');check(await page.locator('.menu-toggle').evaluate(e=>e===document.activeElement),'Escape returns keyboard focus');}
 }
 await page.goto(base+'/company.html#stores');const canvas=page.locator('.solar-frame canvas');await canvas.waitFor();await canvas.scrollIntoViewIfNeeded();
 const a=await canvas.screenshot();await page.waitForTimeout(250);const b=await canvas.screenshot();check(!a.equals(b),'solar animates');
 await page.locator('#motion-toggle').click();await page.waitForTimeout(1000);const c=await canvas.screenshot();await page.waitForTimeout(250);const d=await canvas.screenshot();check(c.equals(d),'solar pause stable');await page.locator('#motion-toggle').click();check((await page.locator('#motion-toggle').innerText()).includes('止める'),'solar resume');
 await page.locator('#planet-selector button').filter({hasText:'カリスト'}).click();check((await page.locator('.store-panel').innerText()).includes('ヴァルハラ'),'Callisto store information');
 check(!errors.length,'no JavaScript errors');check(!failed.length,'no HTTP errors');
 return {passed:checks.length,products:menu.length,errors,failed};
}
module.exports=run;
if(require.main===module){(async()=>{const {chromium}=require('playwright');const browser=await chromium.launch();try{console.log(await run(await browser.newPage()));}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});}
