const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{const module=await import('data:text/javascript;base64,'+fs.readFileSync(path.join(__dirname,'../js/glitch-sequence.js')).toString('base64'));
 const a=module.buildPopupPlan(1440,1000),b=module.buildPopupPlan(1440,1000);assert.deepEqual(a,b,'Intro layout reproducible');assert.ok(a.length>=30,'Popups densely fill the desktop');assert.ok(a[0].at>=350&&a.at(-1).at<2100,'Fast burst before overwrite');assert.ok(new Set(a.map(p=>p.label)).size>=5);assert.ok(a.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.w>0&&p.h>0));
 const reduced=module.buildPopupPlan(390,844,true);assert.ok(reduced.length<=4,'Reduced motion avoids rapid popup barrage');
 assert.equal(module.overwriteProgress(2150),0);assert.equal(module.overwriteProgress(2400),.5);assert.equal(module.overwriteProgress(2650),1);assert.equal(module.overwriteProgress(5000),1);
 console.log('Glitch intro tests passed: deterministic dense burst, reduced-motion variant and 500ms top-down overwrite.');
})().catch(e=>{console.error(e);process.exitCode=1;});
