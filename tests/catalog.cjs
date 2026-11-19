const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'js/menu-data.js'),'utf8'),context);
const menu=context.window.CHICKEN_MENU;
assert.equal(menu.length,32,'32 visually distinct menu products expected');
for(const id of ['layered-sandwich','protein-pie','standard-plate','cube-parfait','custard-tower']) assert.ok(menu.some(m=>m.id===id),'legacy ID '+id);
assert.equal(new Set(menu.map(m=>m.id)).size,menu.length);
for(const m of menu){
 for(const k of ['name','imageAlt','short','description','detail','note','subcategory']) assert.ok(typeof m[k]==='string'&&m[k].trim(),m.id+': '+k);
 assert.ok(Number.isInteger(m.price)&&m.price>0);
 assert.ok(['grill','pasta','rice','side','japanese','dessert','takeout'].includes(m.subcategory));
 assert.equal(typeof m.takeout,'boolean');assert.equal(typeof m.recommended,'boolean');
 for(const p of [{image:m.image},...(m.gallery||[])]) assert.ok(fs.existsSync(path.join(root,p.image)),p.image);
}
const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/image-audit.json'),'utf8'));
assert.equal(manifest.images.length,80);assert.equal(new Set(manifest.images.map(i=>i.source)).size,80);
for(const m of menu)assert.ok(manifest.images.some(i=>i.productId===m.id&&i.usage==='primary'&&i.optimized===m.image),m.id+' mapping');
console.log('Catalog verified: 32 products, 5 retained legacy IDs, all images and 80 source records.');
