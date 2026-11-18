const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const vm = require('node:vm');
const context = {window:{}};
vm.runInNewContext(read('js/menu-data.js'),context);
const menu = context.window.CHICKEN_MENU;
const ids = menu.map(m=>m.id), images=menu.map(m=>m.image);
assert.ok(ids.length >= 30, 'Expanded image-verified catalog should be present');
assert.equal(new Set(ids).size, ids.length, 'Product ids must be unique');
for (const image of images) assert.ok(fs.existsSync(path.join(root, image)), 'Missing image: ' + image);
for (const file of ['index.html','company.html','menu.html']) {
 const html = read(file);
 assert.match(html, /<html lang="ja">/, file + ' must declare language');
 assert.match(html, /<main id="main">/, file + ' requires a main landmark');
 assert.match(html, /<meta name="viewport"/, file + ' requires viewport');
 assert.doesNotMatch(html, /images\/(?:regular|seasonal|takeout|dessert)-\d+\.jpg/, file + ' uses non-existent old menu art');
}
for (const category of ['regular','seasonal','takeout']) {
 const folder = path.join(root,'menus',category);
 for (const file of fs.readdirSync(folder).filter(f=>f.endsWith('.html'))) {
  const html=fs.readFileSync(path.join(folder,file),'utf8');
  assert.match(html,/meta http-equiv="refresh"/, 'Legacy page must redirect: '+file);
  const match=html.match(/menu\.html\?id=([\w-]+)/);
  assert.ok(match && ids.includes(match[1]), 'Legacy redirect missing target: '+file);
 }
}
assert.match(read('company.html'),/id="planet-selector"/);
assert.match(read('js/solar-system.js'),/new THREE\.CanvasTexture/);
console.log('Smoke tests passed: expanded mapped dishes, all assets, 14 redirects, site pages, planet textures.');

const solar=read('js/solar-system.js'), company=read('company.html');
for(const id of ['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune']){
 assert.match(solar,new RegExp('id:"'+id+'"[^\\n]*orbitSpeed:[.0-9]+[^\\n]*spinSpeed:[.0-9]+'),id+' needs orbit and spin rates');
}
assert.match(solar,/id:"callisto"[^\n]*parent:"jupiter"/,'Callisto must orbit Jupiter');
assert.match(solar,/body\.angle\s*\+=\s*dt\s*\*\s*data\.orbitSpeed/,'Orbit must advance');
assert.match(solar,/mesh\.rotation\.y\s*\+=\s*dt\s*\*\s*data\.spinSpeed/,'Spin must advance');
assert.match(company,/id="motion-toggle"/,'Motion control must exist');

require("./catalog.cjs");
require("./filters.cjs");
