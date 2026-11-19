import * as THREE from '../../vendor/three.module.js';

/** Independent ceiling beacon. Copy to js/fps; no renderer/audio/input ownership. */
export function createFacilityAlarm(scene, {quality = 'high', mountHeight = 5.4} = {}) {
  if (!scene?.add) throw new TypeError('createFacilityAlarm requires a Three scene');
  const low = quality === 'low';
  const root = new THREE.Group();
  root.name = 'facility alarm mount';
  root.visible = true;root.position.set(0,mountHeight,-10000);
  scene.add(root);
  const geometries = new Set(), materials = new Set();
  const ownGeometry = value => (geometries.add(value), value);
  const ownMaterial = value => (materials.add(value), value);
  const metal = ownMaterial(new THREE.MeshStandardMaterial({color: 0x202731, roughness: .44, metalness: .83}));
  const rim = ownMaterial(new THREE.MeshStandardMaterial({color: 0x66707a, roughness: .36, metalness: .89}));
  const lens = ownMaterial(new THREE.MeshStandardMaterial({color: 0x730b11, emissive: 0xff1125, emissiveIntensity: 2.5, roughness: .25, metalness: .15}));
  const core = ownMaterial(new THREE.MeshBasicMaterial({color: new THREE.Color(2.1, .025, .045), toneMapped: false}));
  const coneMaterial = low ? null : ownMaterial(new THREE.MeshBasicMaterial({
    color: 0xff1830, transparent: true, opacity: .016,
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true,
    side: THREE.FrontSide, toneMapped: false,
  }));
  const cylinder = ownGeometry(new THREE.CylinderGeometry(1, 1, 1, low ? 8 : 12));
  const box = ownGeometry(new THREE.BoxGeometry(1, 1, 1));
  const cap = ownGeometry(new THREE.CylinderGeometry(1, 1, 1, 6));
  const coneLength = 17;
  const coneGeometry = low ? null : ownGeometry(new THREE.ConeGeometry(4.8, coneLength, 16, 1, true).translate(0, -coneLength / 2, 0));
  function mesh(parent, geometry, material, x, y, z, sx, sy, sz) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z); object.scale.set(sx, sy, sz);
    object.castShadow = false; object.receiveShadow = false;
    parent.add(object);
    return object;
  }
  // Stem reaches the minimum six-metre ceiling with the default mounting height.
  mesh(root, cap, metal, 0, .54, 0, .46, .12, .46);
  mesh(root, cylinder, rim, 0, .29, 0, .07, .45, .07);
  mesh(root, cylinder, metal, 0, .04, 0, .30, .12, .30);
  mesh(root, cylinder, lens, 0, -.14, 0, .23, .25, .23);
  mesh(root, cylinder, rim, 0, -.29, 0, .29, .07, .29);
  const rotor = new THREE.Group(); rotor.name = 'rotating alarm reflector'; root.add(rotor);
  for (const side of [-1, 1]) {
    mesh(rotor, box, metal, side * .26, -.14, 0, .055, .23, .34);
    mesh(rotor, box, core, side * .294, -.14, 0, .018, .12, .18);
    mesh(root, box, metal, side * .31, -.12, 0, .035, .33, .035);
  }
  const beams = [];
  for (let i = 0; i < (low ? 1 : 2); i++) {
    const light = new THREE.SpotLight(0xff1428, 0, 27, .40, .78, 1.55);
    light.name = 'facility alarm rotating red projection';
    light.position.set(0, -.14, 0); light.castShadow = false;
    const target = new THREE.Object3D(); root.add(target); light.target = target; root.add(light);
    const volume = coneGeometry ? mesh(root, coneGeometry, coneMaterial, 0, -.14, 0, 1, 1, 1) : null;
    if (volume) {volume.name = 'thin alarm light haze';volume.visible=false;}
    beams.push({light, target, volume, phase: i * Math.PI});
  }
  const cameraPosition = new THREE.Vector3(), forward = new THREE.Vector3();
  const direction = new THREE.Vector3(), coneAxis = new THREE.Vector3(0, -1, 0);
  let disposed = false, remaining = 0, sectorIndex = -1, sector = '',
    strength = 0, angle = .35, anchored = false, needsAnchor = false;
  const height = Number.isFinite(mountHeight) ? mountHeight : 5.4;

  /** 0..14 = A..O combat sectors; 15+ is the silent final hangar. */
  function trigger(index) {
    if (disposed) return;
    const next = Number.isFinite(index) ? Math.max(0, Math.trunc(index)) : 0;
    if (next >= 15) {
      remaining = 0; sectorIndex = 15; sector = 'HANGAR'; strength = 0;
      root.visible = false; needsAnchor = false;
      for (const beam of beams) beam.light.intensity = 0;
      return;
    }
    if (next !== sectorIndex || !anchored) needsAnchor = true;
    sectorIndex = next; sector = String.fromCharCode(65 + next);
    remaining = 8; strength = 1;
  }

  function update(dt, time, camera, {reducedMotion = false} = {}) {
    if (disposed || sectorIndex < 0 || sectorIndex >= 15) return;
    const delta = Number.isFinite(dt) ? Math.min(.25, Math.max(0, dt)) : 0;
    if (needsAnchor && camera?.getWorldPosition && camera?.getWorldDirection) {
      camera.getWorldPosition(cameraPosition); camera.getWorldDirection(forward);
      forward.y = 0;
      if (forward.lengthSq() < .001) forward.set(0, 0, -1);
      else forward.normalize();
      // Mount stays in this sector. Camera strafing never drags the beacon along.
      root.position.set(0, height, cameraPosition.z + forward.z * 9);
      root.visible = true; needsAnchor = false; anchored = true;
    }
    remaining = Math.max(0, remaining - delta);
    const active = remaining > 0;
    // No strobe: continuous sweep with a smooth final-second falloff.
    const targetStrength = active ? .18 + .82 * Math.min(1, remaining) : .085;
    strength += (targetStrength - strength) * (1 - Math.exp(-delta * 7));
    if (!reducedMotion) angle += delta * (active ? 2.6 : .22);
    angle %= Math.PI * 2;
    rotor.rotation.y = angle;
    lens.emissiveIntensity = .32 + strength * 2.8;
    core.color.setRGB(.28 + strength * 1.9, .004 + strength * .021, .006 + strength * .039);
    for (const beam of beams) {
      const a = angle + beam.phase;
      // Opposing washes read on walls/floor and ceiling, without aiming at eyes.
      const tilt = low ? -.025 + .10 * Math.sin(a * .7)
        : beam.phase ? .055 + .035 * Math.sin(a * .7) : -.22 - .06 * Math.sin(a * .7);
      direction.set(Math.cos(a), tilt, Math.sin(a)).normalize();
      beam.target.position.copy(direction).multiplyScalar(19); beam.target.position.y -= .14;
      beam.light.intensity = (low ? 145 : 195) * strength;
      if (beam.volume) {
        beam.volume.quaternion.setFromUnitVectors(coneAxis, direction);
        beam.volume.visible = !reducedMotion && active;
      }
    }
    if (coneMaterial) coneMaterial.opacity = .017 * strength;
    root.updateMatrixWorld(true);
  }

  function stats() {
    return {active: !disposed && remaining > 0 && sectorIndex < 15,
      sector, sectorIndex, strength: disposed ? 0 : strength, remaining,
      anchored, rotation: angle, lights: disposed ? 0 : beams.length,
      resourceCounts: {geometries: geometries.size, materials: materials.size}};
  }

  function dispose() {
    if (disposed) return;
    disposed = true; remaining = 0; strength = 0;
    root.removeFromParent();
    for (const beam of beams) { beam.light.intensity = 0; beam.light.dispose(); }
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    root.clear(); geometries.clear(); materials.clear();
  }
  return {root, trigger, update, stats, dispose};
}
