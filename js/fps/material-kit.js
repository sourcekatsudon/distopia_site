import * as THREE from '../../vendor/three.module.js';
const SIZE = { high: 512, medium: 256, low: 128 };
const fr = x => x - Math.floor(x), mix = (a, b, t) => a + (b - a) * t, mx3 = (a, b, t) => a.map((x, i) => mix(x, b[i], t));
const sm = (a, b, x) => { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
function hash(x, y, s) { let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(s, 1442695041); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
// tileable value noise (px,py = lattice period); fixed integer seeds, never Math.random
function vn(x, y, px, py, s) {
  const xi = Math.floor(x), yi = Math.floor(y), tx = sm(0, 1, x - xi), ty = sm(0, 1, y - yi);
  const g = (i, j) => hash(((i % px) + px) % px, ((j % py) + py) % py, s);
  return mix(mix(g(xi, yi), g(xi + 1, yi), tx), mix(g(xi, yi + 1), g(xi + 1, yi + 1), tx), ty);
}
const fbm = (u, v, p, s, o = 4) => { let a = 0, w = .5, t = 0; for (let i = 0; i < o; i++) { const q = p * 2 ** i; a += w * vn(u * q, v * q, q, q, s + i); t += w; w /= 2; } return a / t; };
// pattern fns return [height, r,g,b (albedo), roughness, metalness, ao, r2,g2,b2 (2nd albedo)]
const LINES = [[7, 2], [5, -3], [3, 8], [11, -1]]; // integer directions => seamless scratches
const scratch = (u, v) => {
  const br = vn(u * 3, v * 160, 3, 160, 1) * .6 + vn(u * 6, v * 320, 6, 320, 2) * .4; // anisotropic brushing along u
  let g = 0;
  LINES.forEach(([a, b], i) => { const t = fr(a * u + b * v + hash(i, 5, 9)), d = Math.min(t, 1 - t); g += Math.exp(-((d / .02) ** 2)) * sm(.5, .75, vn(u * 3, v * 3, 3, 3, 10 + i)); });
  g = Math.min(g, 1);
  return [.6 + (br - .5) * .06 - g * .07, 0, 0, 0, .40 + br * .08 + g * .08, .97 - g * .1];
};
const weave = (u, v) => { // 2x2 twill, tows over/under
  const x = u * 8, y = v * 8, i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, warp = ((i - j) % 4 + 4) % 4 < 2;
  const sx = Math.sin(Math.PI * fx), sy = Math.sin(Math.PI * fy);
  const h = warp ? .55 + .35 * sx * (.75 + .25 * sy) + .01 * Math.sin(fx * 24) : .25 + .35 * sy * (.75 + .25 * sx) + .01 * Math.sin(fy * 24);
  return [h, 0, 0, 0, .3, 0];
};
const grain = (u, v) => { const h = vn(u * 64, v * 64, 64, 64, 70) * .6 + vn(u * 128, v * 128, 128, 128, 71) * .4; return [h, 0, 0, 0, .78 + .2 * h, 0]; };
const wear = (u, v) => { // voronoi paint flakes (+) warped fbm oxide blotches and pits
  const gx = u * 9, gy = v * 9; let d = 9, id = 0;
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    const ci = Math.floor(gx) + i, cj = Math.floor(gy) + j, a = ((ci % 9) + 9) % 9, b = ((cj % 9) + 9) % 9;
    const dd = Math.hypot(gx - ci - hash(a, b, 31), gy - cj - hash(a, b, 32)); if (dd < d) { d = dd; id = hash(a, b, 33); }
  }
  const c = id < sm(.3, .7, fbm(u, v, 3, 20, 3)) * .85 ? sm(.62, .42, d) : 0;
  const wu = fbm(u, v, 4, 41, 3) - .5, o = sm(.5, .66, fbm(u + wu * .25, v + wu * .25, 5, 50, 4));
  const pit = o * sm(.72, .9, vn(u * 48, v * 48, 48, 48, 60)), fn = vn(u * 96, v * 96, 96, 96, 61);
  const steel = [.46, .46, .48], rust = [.5, .24, .1], paint = [.22, .27, .18].map(x => x * (.92 + .16 * fn));
  return [mix(.7, .4, c) + c * (1 - c) * .32 + fn * .03 - pit * .15, ...mx3(paint, mx3(steel, rust, o), c),
    mix(.55 + fn * .1, mix(.4, .85, o), c), c * (1 - o) * .95, 1 - pit * .5,
    ...mx3(steel.map(x => x * .9), mx3(rust, [.55, .27, .1], fn), o).map(x => mix(x, rust[0] * .5, 0) * (1 - .45 * pit))];
};
function bake(n, f, k, two) {
  const cv = () => { const c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d'); return { c, x, d: x.createImageData(n, n) }; };
  const A = cv(), R = cv(), N = cv(), A2 = two && cv(), h = new Float32Array(n * n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const o = f((x + .5) / n, (y + .5) / n), p = (y * n + x) * 4; h[y * n + x] = o[0];
    A.d.data.set([o[1] * 255, o[2] * 255, o[3] * 255, 255], p);
    R.d.data.set([(o[6] ?? 1) * 255, o[4] * 255, o[5] * 255, 255], p); // G=roughness, B=metalness, R=ao
    if (two) A2.d.data.set([o[7] * 255, o[8] * 255, o[9] * 255, 255], p);
  }
  const q = (i, j) => h[((j + n) % n) * n + (i + n) % n], s = k * n / 512; // resolution-independent slope
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { // central differences, flat => (128,128,255)
    const nx = -(q(x + 1, y) - q(x - 1, y)) * .5 * s, ny = (q(x, y + 1) - q(x, y - 1)) * .5 * s, l = Math.hypot(nx, ny, 1);
    N.d.data.set([(nx / l * .5 + .5) * 255, (ny / l * .5 + .5) * 255, (1 / l * .5 + .5) * 255, 255], (y * n + x) * 4);
  }
  [A, R, N, A2].forEach(o => o && o.x.putImageData(o.d, 0, 0));
  return { a: A.c, r: R.c, n: N.c, a2: A2 && A2.c };
}
const tex = (cv, srgb) => { const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = 4; return t; };
const V2 = s => new THREE.Vector2(s, s);

function buildSurfaceKit({ quality = 'high' } = {}) {
  const n = SIZE[quality] || SIZE.high, T = new Set(), Ms = new Set(); let dead = false;
  const S = bake(n, scratch, .8), B = bake(n, weave, 14), W = bake(n, wear, 6, true), G = bake(Math.min(n, 128), grain, 4);
  const canvases = [S, B, W, G].flatMap(o => Object.values(o).filter(Boolean));
  const own = t => (T.add(t), t);
  const nS = own(tex(S.n)), rmS = own(tex(S.r)), nB = own(tex(B.n)), nW = own(tex(W.n)), aW = own(tex(W.a, true)), aO = own(tex(W.a2, true)), rmW = own(tex(W.r)), nG = own(tex(G.n)), rmG = own(tex(G.r));
  // clones share the image source (no extra GPU memory) but give each material its own scale/rotation
  const view = (t, rep, rot = 0) => { const c = own(t.clone()); c.repeat.set(rep, rep); c.rotation = rot; c.center.set(.5, .5); c.needsUpdate = true; return c; };
  const mk = (C, p) => { const m = new C(p); Ms.add(m); return m; };
  const metal = (color, rep, rot, ns, rf, x = {}, C = THREE.MeshStandardMaterial) => {
    const rm = view(rmS, rep, rot);
    return mk(C, { color, metalness: 1, roughness: rf, normalMap: view(nS, rep, rot), normalScale: V2(ns*.5), roughnessMap: rm, metalnessMap: rm, envMapIntensity: 1.4, ...x });
  };
  const kit = {
    titanium: metal(0x9eacb8, 1, 0, .35, 1),
    anodized: metal(0x161e28, 2, Math.PI / 2, .2, 1.1, { clearcoat: .35, clearcoatRoughness: .35 }, THREE.MeshPhysicalMaterial),
    gunmetal: metal(0x6a7078, 1.5, Math.PI / 4, .5, 1.25),
    skeleton: metal(0x3a4048, 3, -Math.PI / 6, .3, 1.5, { side: THREE.DoubleSide }),
    painted: mk(THREE.MeshStandardMaterial, { map: aW, normalMap: nW, normalScale: V2(.45), roughnessMap: rmW, metalnessMap: rmW, metalness: 1, roughness: 1, envMapIntensity: 1.2 }),
    corroded: mk(THREE.MeshStandardMaterial, { map: aO, normalMap: nW, normalScale: V2(.8), aoMap: rmW, aoMapIntensity: .8, roughness: .82, metalness: .55, envMapIntensity: 1.2 }),
    carbon: mk(THREE.MeshPhysicalMaterial, { color: 0x202226, metalness: 0, roughness: .32, normalMap: nB, normalScale: V2(.6), clearcoat: .35, clearcoatRoughness: .22 }),
    ceramic: mk(THREE.MeshPhysicalMaterial, { color: 0x343b44, metalness: 0, roughness: .42, roughnessMap: view(rmG, 3), clearcoat: .4, clearcoatRoughness: .12 }),
    rubber: mk(THREE.MeshStandardMaterial, { color: 0x1a1b1d, metalness: 0, roughness: 1, roughnessMap: view(rmG, 4), normalMap: view(nG, 4), normalScale: V2(.35) }),
    energy: mk(THREE.MeshStandardMaterial, { color: 0x06232e, emissive: 0x35d0ff, emissiveIntensity: 2.2, metalness: 0, roughness: .25, roughnessMap: view(rmG, 2), transparent: true, opacity: .92 }),
  };
  kit.dispose = () => {
    if (dead) return; dead = true;
    Ms.forEach(m => m.dispose()); T.forEach(t => t.dispose());
    canvases.forEach(c => { c.width = c.height = 0; }); Ms.clear(); T.clear();
  };
  return kit;
}

const surfaceCache=new Map();
export function createSurfaceKit(options={}){const key=options.quality||'high';let item=surfaceCache.get(key);if(!item){item={kit:buildSurfaceKit(options),refs:0};surfaceCache.set(key,item);}item.refs++;let released=false;return {...item.kit,dispose(){if(released)return;released=true;if(--item.refs===0){item.kit.dispose();surfaceCache.delete(key);}}};}
