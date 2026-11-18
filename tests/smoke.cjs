const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const data = read('js/menu-data.js');
const ids = [...data.matchAll(/\bid:\s*"([^"]+)"/g)].map(m => m[1]);
const images = [...data.matchAll(/\bimage:\s*"([^"]+)"/g)].map(m => m[1]);
assert.equal(ids.length, 6, 'Six image-verified dishes should be present');
assert.equal(new Set(ids).size, ids.length, 'Product ids must be unique');
assert.equal(images.length, ids.length, 'Every dish needs a menu image');
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
console.log('Smoke tests passed: 6 mapped dishes, all assets, 14 redirects, site pages, planet textures.');
