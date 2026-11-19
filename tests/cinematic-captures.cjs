// Fixed-step captures of real runtime factories and the selected rendering preset.
async function run(page,{base='http://127.0.0.1:8765',dir,part='poses'}={}){
 await page.setViewportSize({width:1440,height:1000});await page.bringToFront();await page.goto(base+'/?protocol=play&fpsdebug=1');await page.waitForFunction(()=>window.CHICKEN_FPS?.lab,null,{timeout:30000});
 const results=[];const shot=async name=>{await page.evaluate(()=>CHICKEN_FPS.labStep(0));await page.screenshot({path:dir+'/'+name+'.png'});results.push({name,stats:await page.evaluate(()=>CHICKEN_FPS.stats())});};
 const poses=['weapon-idle','weapon-turn','weapon-charge','weapon-normal-fire','weapon-fire','enemy-dark','enemy-close','enemy-far','enemy-oblique','heavy-combat','reactor-wide','ruler-front','ruler-oblique','material-comparison','shield-hit'];
 if(part==='poses'){for(const name of poses){await page.evaluate(n=>CHICKEN_FPS.lab(n),name);await page.waitForTimeout(100);await shot(name);}}
 else{for(const [name,dt,count]of [['weapon-fire',.03,10],['enemy-destroy',.07,10],['enemy-tracer',.04,12],['weapon-reload',.20,10],['enemy-walk',.07,10],['enemy-hit',.04,10]].filter(([n])=>part==='sequences'||part===n)){await page.evaluate(n=>CHICKEN_FPS.lab(n),name);for(let i=0;i<count;i++){await shot(name+'-'+String(i).padStart(2,'0'));await page.evaluate(d=>CHICKEN_FPS.labStep(d),dt);}}}
 return results;
}
module.exports=run;
