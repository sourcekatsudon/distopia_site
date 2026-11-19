const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const data = source => 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
(async () => {
  const base = path.resolve(__dirname, '..');
  const THREE = await import(data(fs.readFileSync(path.join(base, 'vendor/three.module.js'), 'utf8')));
  globalThis.__ALARM_THREE__ = THREE;
  const source = fs.readFileSync(path.join(base, 'js/fps/facility-alarm.js'), 'utf8')
    .replace("import * as THREE from '../../vendor/three.module.js';", 'const THREE = globalThis.__ALARM_THREE__;');
  const {createFacilityAlarm} = await import(data(source));
  for (const quality of ['low', 'high']) {
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera();
    const existing = new THREE.PointLight(0x123456, 12); scene.add(existing);
    camera.position.set(2, 1.7, 7); camera.updateMatrixWorld(true);
    const alarm = createFacilityAlarm(scene, {quality});
    assert.equal(alarm.stats().lights, quality === 'low' ? 1 : 2);
    assert.equal(alarm.stats().active, false);
    alarm.trigger(1); alarm.update(1 / 60, 0, camera, {});
    assert.equal(alarm.stats().sector, 'B'); assert.equal(alarm.stats().active, true);
    assert.equal(alarm.root.position.x, 0); assert.equal(alarm.root.position.y, 5.4);
    assert.equal(alarm.root.position.z, -2);
    camera.position.z -= 20; alarm.update(1 / 60, 0, camera, {});
    assert.equal(alarm.root.position.z, -2, 'Beacon must stay fixed while walking');
    alarm.trigger(1); alarm.update(1 / 60, 0, camera, {});
    assert.equal(alarm.root.position.z, -2, 'Retrigger must not move beacon');
    const angle = alarm.stats().rotation;
    alarm.update(.1, 0, camera, {reducedMotion: true});
    assert.equal(alarm.stats().rotation, angle);
    alarm.trigger(2); alarm.update(1 / 60, 0, camera, {});
    assert.equal(alarm.root.position.z, -22, 'New sector relocates beacon');
    const geometries = new Set(), materials = new Set(), lights = [];
    alarm.root.traverse(o => {
      if (o.geometry) {
        geometries.add(o.geometry);
        for (const value of o.geometry.attributes.position.array) assert.ok(Number.isFinite(value));
      }
      if (o.material) materials.add(o.material);
      if (o.isLight) {lights.push(o); assert.equal(o.castShadow, false);}
    });
    for (let i = 0; i < 900; i++) alarm.update(1 / 60, i / 60, camera, {});
    assert.equal(alarm.stats().active, false); assert.equal(alarm.stats().remaining, 0);
    assert.ok(Math.abs(alarm.stats().strength - .085) < .001);
    alarm.update(NaN, Infinity, camera, {}); alarm.update(-5, 0, camera, {});
    alarm.root.traverse(o => {for (const value of o.matrixWorld.elements) assert.ok(Number.isFinite(value));});
    alarm.trigger(14); assert.equal(alarm.stats().sector, 'O');
    alarm.trigger(15); assert.equal(alarm.stats().active, false); assert.equal(alarm.root.visible, false);
    assert.ok(lights.every(l => l.intensity === 0));
    alarm.trigger(0); alarm.update(1 / 60, 0, camera, {}); assert.equal(alarm.root.visible, true);
    let geometryDisposals = 0, materialDisposals = 0;
    for (const g of geometries) g.addEventListener('dispose', () => geometryDisposals++);
    for (const m of materials) m.addEventListener('dispose', () => materialDisposals++);
    alarm.dispose(); alarm.dispose(); alarm.update(.1, 0, camera, {}); alarm.trigger(2);
    assert.equal(geometryDisposals, geometries.size); assert.equal(materialDisposals, materials.size);
    assert.deepEqual(scene.children, [existing]); assert.equal(existing.intensity, 12);
    assert.equal(existing.color.getHex(), 0x123456);
    assert.equal(alarm.stats().active, false); assert.equal(alarm.stats().lights, 0);
    console.log(JSON.stringify({quality, passed: true, geometries: geometries.size, materials: materials.size, lights: lights.length}));
  }
  delete globalThis.__ALARM_THREE__;
})().catch(error => {console.error(error); process.exitCode = 1;});
