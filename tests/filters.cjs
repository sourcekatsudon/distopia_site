const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{},document:{addEventListener(){}}};vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../js/script.js'),'utf8'),ctx);
const api=ctx.window.CHICKEN_CATALOG;assert.ok(api,'Pure catalog search API must exist');
const m={id:'a',category:'main',subcategory:'rice',takeout:true,recommended:false,name:'合成ロースカツ丼',short:'キューブ',description:'ABC'};
assert.equal(api.matches(m,'rice',' カツ '),true);assert.equal(api.matches(m,'dessert','カツ'),false);assert.equal(api.matches(m,'takeout','ＡＢＣ'),true);assert.equal(api.matches(m,'recommended',''),false);assert.equal(api.matches(m,'main',''),true);assert.equal(api.select([m],'all','存在しない').length,0);
console.log('Catalog search/filter unit checks passed');
