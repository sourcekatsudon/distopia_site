import * as THREE from '../../vendor/three.module.js';
export function createRailgun({ quality = 'high' } = {}) {
  const hi = quality === 'high', S = hi ? 24 : 10, R = Math.PI / 2;
  const root = new THREE.Group(), rig = new THREE.Group(), armor = new THREE.Group(), bar = new THREE.Group(), acc = new THREE.Group(), fanGrp = new THREE.Group();
  root.name = 'Railgun'; root.add(rig); rig.add(armor); armor.add(bar); bar.add(acc);
  const geos = [], mats = [], texs = [];
  const G = g => (geos.push(g), g);
  const M = p => { const m = new THREE.MeshStandardMaterial(p); mats.push(m); return m; };
  const black = M({ color: 0x07090c, metalness: .7, roughness: .35 }), silver = M({ color: 0xaab4bd, metalness: .95, roughness: .25 }), gun = M({ color: 0x2a3138, metalness: .8, roughness: .45 });
  const glove = M({ color: 0x15191e, metalness: .3, roughness: .7 }), yellow = M({ color: 0xf2c200, metalness: .2, roughness: .6 });
  const cy = { color: 0x0a3a48, emissive: 0x19e6ff, emissiveIntensity: 1.5, metalness: .6, roughness: .2 };
  const railMat = M(cy), cellMat = M(cy), lineMat = M(cy);
  const add = (g, m, x, y, z, p = armor, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(G(g), m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); p.add(o); return o; };
  const ext = (w, h, d, r, b) => { const s = new THREE.Shape(); s.moveTo(-w + r, -h); s.lineTo(w - r, -h); s.lineTo(w, -h + r); s.lineTo(w, h - r); s.lineTo(w - r, h); s.lineTo(-w + r, h); s.lineTo(-w, h - r); s.lineTo(-w, -h + r); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 2 }); g.translate(0, 0, -d / 2); return g; };
  const limb = (a, b, r, m, p = rig) => { const g = G(new THREE.CylinderGeometry(r, r * .8, a.distanceTo(b), S)); const o = new THREE.Mesh(g, m); o.position.copy(a).add(b).multiplyScalar(.5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); p.add(o); return o; };
  const tex = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; texs.push(t); return t; };
  // receiver, plates, cover
  add(ext(.1, .1, .7, .03, .012), black, 0, 0, 0);
  const plateG = ext(.012, .07, .55, .01, .006);
  add(plateG, silver, -.115, 0, 0); add(plateG, silver, .115, 0, 0);
  add(ext(.08, .01, .5, .005, .005), silver, 0, .118, .02);
  const cover = add(ext(.07, .015, .3, .006, .006), gun, 0, .14, -.02);
  add(new THREE.CylinderGeometry(.045, .05, .06, S), gun, 0, .0, .38, armor, R);
  // barrel, rails, accelerator
  add(new THREE.CylinderGeometry(.04, .045, .6, S), black, 0, .02, -.62, armor, R);
  const railG = new THREE.CylinderGeometry(.016, .016, .66, 10);
  add(railG, railMat, -.07, .02, -.62, bar, R); add(railG, railMat, .07, .02, -.62, bar, R);
  add(new THREE.TorusGeometry(.09, .02, 8, S), silver, 0, .02, -.9, acc);
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; add(new THREE.BoxGeometry(.07, .014, .02), gun, Math.cos(a) * .045, .02 + Math.sin(a) * .045, -.9, acc, 0, 0, a); }
  add(new THREE.CylinderGeometry(.03, .03, .06, S), railMat, 0, .02, -.93, bar, R);
  const muzzle = new THREE.Object3D(); muzzle.position.set(0, .02, -.98); bar.add(muzzle);
  const coils = [];
  for (let i = 0; i < (hi ? 4 : 3); i++) coils.push(add(new THREE.TorusGeometry(.1, .014, 6, hi ? 14 : 8), i % 2 ? silver : railMat, 0, .02, -.42 - i * .12));
  // energy line dashes
  const dashG = new THREE.BoxGeometry(.012, .012, .06), dashes = [];
  for (let i = 0; i < 16; i++) dashes.push(add(dashG, lineMat, i < 8 ? -.143 : .143, .065, -.4, armor));
  // fan
  add(new THREE.CylinderGeometry(.055, .06, .03, S), black, 0, .13, .26);
  fanGrp.position.set(0, .15, .26); armor.add(fanGrp);
  const bladeG = new THREE.BoxGeometry(.05, .004, .014);
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, b = add(bladeG, silver, Math.cos(a) * .028, 0, Math.sin(a) * .028, fanGrp); b.rotation.set(.3, -a, 0); }
  // pistons
  const pistons = [];
  for (const sx of [-1, 1]) {
    add(new THREE.CylinderGeometry(.02, .02, .28, 12), gun, sx * .15, -.01, .08, armor, R);
    const rod = new THREE.Group(); rod.position.set(sx * .15, -.01, -.1); armor.add(rod); pistons.push(rod);
    add(new THREE.CylinderGeometry(.01, .01, .24, 8), silver, 0, 0, -.1, rod, R);
  }
  // cooling fins
  const finG = new THREE.BoxGeometry(.1, .006, .05), fins = [];
  for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const p = new THREE.Group(); p.position.set(sx * .1, .105, -.2 + i * .1); armor.add(p); add(finG, silver, sx * .05, 0, 0, p); fins.push([p, sx]); }
  // energy cell + wires
  add(new THREE.CylinderGeometry(.035, .035, .2, S), cellMat, 0, -.125, .02, armor, R);
  for (const z of [-.09, .13]) add(new THREE.TorusGeometry(.038, .008, 6, S), silver, 0, -.125, z);
  const wire = (pts, m) => add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 20, .006, 6), m, 0, 0, 0);
  wire([[-.03, -.12, -.1], [-.14, -.08, -.2], [-.13, .0, -.4], [-.08, .03, -.5]], gun);
  wire([[.03, -.12, -.1], [.14, -.07, -.2], [.13, .02, -.4], [.08, .03, -.55]], railMat);
  // side display + hazard labels
  const disp = tex(256, 128, (c, w, h) => { c.fillStyle = '#04141a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#19e6ff'; c.lineWidth = 4; c.strokeRect(3, 3, w - 6, h - 6); c.fillStyle = '#19e6ff'; c.font = 'bold 38px monospace'; c.fillText('ARC-RG7', 14, 48); c.font = '20px monospace'; c.fillText('CHICKEN HOUSE', 14, 82); c.fillStyle = '#7fdfff'; c.fillText('BLUE REQUIEM', 14, 108); });
  const haz = tex(64, 32, (c, w, h) => { c.fillStyle = '#f2c200'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; for (let x = -h; x < w; x += 16) { c.beginPath(); c.moveTo(x, h); c.lineTo(x + 8, h); c.lineTo(x + 8 + h, 0); c.lineTo(x + h, 0); c.fill(); } });
  const dg = G(new THREE.PlaneGeometry(.2, .1)).rotateY(-R), hg = G(new THREE.PlaneGeometry(.07, .035)).rotateY(-R);
  add(dg, new THREE.MeshBasicMaterial({ map: disp }), -.13, .0, .02); mats.push(armor.children[armor.children.length - 1].material);
  add(hg, new THREE.MeshBasicMaterial({ map: haz }), -.13, -.06, .22); mats.push(armor.children[armor.children.length - 1].material);
  add(hg, armor.children[armor.children.length - 1].material, -.13, .06, -.2);
  // grip, trigger guard
  add(new THREE.CylinderGeometry(.032, .04, .22, S), glove, 0, -.2, .3, armor, -.25);
  add(new THREE.TorusGeometry(.05, .008, 6, S, Math.PI).rotateY(R).rotateX(Math.PI), silver, 0, -.1, .14);
  // right hand fingers + mechanical forearm
  const fingerG = new THREE.CapsuleGeometry(.014, .03, 4, 8);
  for (let i = 0; i < 4; i++) add(fingerG, glove, 0, -.15 - i * .035, .24 - i * .004, rig, 0, 0, R);
  add(fingerG, glove, -.045, -.1, .3, rig, .5, 0, 0);
  limb(new THREE.Vector3(.01, -.28, .36), new THREE.Vector3(.2, -.45, .85), .04, gun);
  limb(new THREE.Vector3(.05, -.31, .45), new THREE.Vector3(.2, -.45, .85), .05, black);
  add(new THREE.SphereGeometry(.05, S, 8), silver, .01, -.28, .36, rig);
  // left support hand + forearm
  for (let i = 0; i < 4; i++) add(fingerG, glove, 0, -.075, -.18 - i * .035, rig, R, 0, R);
  add(new THREE.SphereGeometry(.04, 12, 8), gun, .035, -.09, -.12, rig);
  limb(new THREE.Vector3(.04, -.1, -.12), new THREE.Vector3(-.3, -.5, .45), .035, gun);
  limb(new THREE.Vector3(-.05, -.17, -.0), new THREE.Vector3(-.3, -.5, .45), .045, black);
  const light = new THREE.PointLight(0x19e6ff, 0, 3); light.position.set(0, .02, -.1); muzzle.add(light);
  let recoil = 0, heat = 0, glow = 0, fan = 0, cs = 0, as = 0;
  function fire(power = 1) { recoil = Math.min(1.5, recoil + power); heat = Math.min(1, heat + .4 * power); glow = 1; }
  function update(dt, s = {}) {
    const t = s.time || 0, ch = s.charge || 0, dep = s.deploy == null ? 1 : s.deploy, spr = s.sprinting ? 1 : 0;
    recoil *= Math.exp(-dt * 8); heat *= Math.exp(-dt * 1.1); glow *= Math.exp(-dt * 5);
    fan += dt * (6 + ch * 30 + heat * 20); fanGrp.rotation.y = fan;
    cs += dt * (1 + ch * 14); coils.forEach((c, i) => c.rotation.z = cs * (i % 2 ? -1 : 1));
    as += dt * (2 + ch * 25 + glow * 10); acc.rotation.z = as;
    bar.position.z = -ch * .08 + recoil * .03;
    const pulse = .8 + .3 * Math.sin(t * 5) + ch * .8 + glow * 1.5;
    railMat.emissiveIntensity = pulse * 1.3; cellMat.emissiveIntensity = .9 + .5 * Math.sin(t * 2.3) + ch; lineMat.emissiveIntensity = 1 + glow * 2;
    dashes.forEach((m, i) => { const f = (((i % 8) / 8 + t * .6) % 1 + 1) % 1; m.position.z = .24 - f * 1.12; m.scale.z = .3 + Math.sin(f * Math.PI) * 1.2; });
    cover.position.z = -.02 - Math.min(recoil, 1) * .06 - ch * .05;
    pistons.forEach(p => p.position.z = -.1 + recoil * .06 + ch * .04);
    fins.forEach(([p, sx]) => p.rotation.z = sx * heat * .9);
    armor.scale.set(1, 1 + Math.sin(t * 1.7) * .008, 1);
    light.intensity = ch * .8 + glow * 2;
    const sp = Math.min((s.speed || 0) / 6, 1) * (s.grounded === false ? .15 : 1), ph = t * 9 * (spr ? 1.4 : 1) * .5, w = Math.sin(ph);
    rig.position.set(w * .012 * sp, -(1 - dep) * .5 - Math.abs(w) * .012 * sp - spr * .03 + Math.sin(t * 1.3) * .002, recoil * .1);
    rig.rotation.set(recoil * .1 + (1 - dep) * .7 + spr * .12, w * .02 * sp + spr * .15, w * .015 * sp);
  }
  function dispose() { root.removeFromParent(); new Set(geos).forEach(g => g.dispose()); new Set(mats).forEach(m => m.dispose()); new Set(texs).forEach(t => t.dispose()); }
  return { root, muzzle, update, fire, dispose };
}
