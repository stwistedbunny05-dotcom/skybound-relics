// Skybound Relics — Master Minecraft/Roblox-Grade Textured HD Architecture,
// Animated Caustic Water Fountain & Moats, 5 Official Sculpted Portals & Full-Roof Walk-In Mega-Castle!
import * as THREE from '../lib/three.module.min.js';

const _matCache = new Map();
export function resetHdAssetCache() {
  _matCache.clear();
}

function flatMat(hex, emissive = false, extra = {}) {
  const key = `${hex}_${emissive ? 1 : 0}_${extra.opacity ?? 1}_${extra.transparent ? 1 : 0}`;
  if (_matCache.has(key) && !extra.unique) return _matCache.get(key);
  const mat = emissive
    ? new THREE.MeshBasicMaterial({ color: hex, transparent: !!extra.transparent, opacity: extra.opacity ?? 1 })
    : new THREE.MeshLambertMaterial({ color: hex, transparent: !!extra.transparent, opacity: extra.opacity ?? 1 });
  if (!extra.unique) _matCache.set(key, mat);
  return mat;
}

// World-scaled UV BoxGeometry so 32x32 pixel-art bricks, wood & roof tiles stay razor-crisp at ANY size!
function makeTiledBoxGeo(w, h, d, tileSize = 1.6) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const uv = geo.attributes.uv;
  const scales = [
    [d / tileSize, h / tileSize], [d / tileSize, h / tileSize],
    [w / tileSize, d / tileSize], [w / tileSize, d / tileSize],
    [w / tileSize, h / tileSize], [w / tileSize, h / tileSize],
  ];
  for (let f = 0; f < 6; f++) {
    const [su, sv] = scales[f];
    for (let i = 0; i < 4; i++) {
      const idx = f * 4 + i;
      uv.setXY(idx, uv.getX(idx) * Math.max(0.25, su), uv.getY(idx) * Math.max(0.25, sv));
    }
  }
  uv.needsUpdate = true;
  return geo;
}

function box(parent, x, y, z, w, h, d, hexOrMat, opts = {}) {
  const isMat = hexOrMat && typeof hexOrMat === 'object' && hexOrMat.isMaterial;
  const geo = isMat ? makeTiledBoxGeo(w, h, d, opts.tile || 1.8) : new THREE.BoxGeometry(w, h, d);
  const mat = opts.mat || (isMat ? hexOrMat : flatMat(hexOrMat, !!opts.emissive, opts));
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (opts.rx) m.rotation.x = opts.rx;
  if (opts.ry) m.rotation.y = opts.ry;
  if (opts.rz) m.rotation.z = opts.rz;
  m.castShadow = opts.shadow !== false && !opts.emissive;
  m.receiveShadow = !opts.emissive;
  parent.add(m);
  return m;
}

function pyr(parent, x, y, z, r, h, hexOrMat, opts = {}) {
  const isMat = hexOrMat && typeof hexOrMat === 'object' && hexOrMat.isMaterial;
  const geo = new THREE.ConeGeometry(r, h, 4);
  if (isMat) {
    const uv = geo.attributes.uv;
    const sc = Math.max(1, r * 0.7);
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * sc, uv.getY(i) * sc);
    uv.needsUpdate = true;
  }
  const mat = opts.mat || (isMat ? hexOrMat : flatMat(hexOrMat, !!opts.emissive, opts));
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.y = (opts.ry ?? Math.PI / 4);
  if (opts.rx) m.rotation.x = opts.rx;
  if (opts.rz) m.rotation.z = opts.rz;
  m.castShadow = !opts.emissive;
  m.receiveShadow = !opts.emissive;
  parent.add(m);
  return m;
}

function oct(parent, x, y, z, r, sy, hex) {
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(r, 0), flatMat(hex, true));
  m.position.set(x, y, z);
  m.scale.set(1, sy, 1);
  parent.add(m);
  return m;
}

// =========================================================================
// 1. LIVE ANIMATED 4-LAYER PIXELATED VOXEL FIRE + RISING SPARK CUBES!
// =========================================================================
export function addVoxelFire(parent, x, y, z, scale = 1.0, animHooks = [], style = 'fire') {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);

  const pal = style === 'soul'
    ? { bed: 0x1e3a8a, c1: 0xe0f2fe, c2: 0x38bdf8, c3: 0x6366f1, c4: 0xa855f7 }
    : { bed: 0x7f1d1d, c1: 0xfef9c3, c2: 0xfde047, c3: 0xf97316, c4: 0xef4444 };

  const s = scale;
  box(g, 0, 0.05 * s, 0, 0.56 * s, 0.10 * s, 0.56 * s, pal.bed, { emissive: true });
  const core = box(g, 0, 0.22 * s, 0, 0.28 * s, 0.30 * s, 0.28 * s, pal.c1, { emissive: true });
  const m1 = box(g, -0.11 * s, 0.32 * s, 0.07 * s, 0.23 * s, 0.38 * s, 0.23 * s, pal.c2, { emissive: true });
  const m2 = box(g, 0.11 * s, 0.29 * s, -0.07 * s, 0.23 * s, 0.34 * s, 0.23 * s, pal.c2, { emissive: true });
  const o1 = box(g, -0.18 * s, 0.44 * s, -0.05 * s, 0.19 * s, 0.38 * s, 0.19 * s, pal.c3, { emissive: true });
  const o2 = box(g, 0.17 * s, 0.48 * s, 0.08 * s, 0.18 * s, 0.40 * s, 0.18 * s, pal.c3, { emissive: true });
  const tip = box(g, 0, 0.72 * s, 0, 0.16 * s, 0.28 * s, 0.16 * s, pal.c4, { emissive: true });

  const sparks = [];
  for (let i = 0; i < 3; i++) {
    const sp = box(g, 0, 0.7 * s, 0, 0.09 * s, 0.09 * s, 0.09 * s, i === 0 ? pal.c2 : pal.c3, { emissive: true });
    sparks.push({ mesh: sp, offset: i * 0.33, seed: x * 0.3 + z * 0.7 + i * 2.1 });
  }

  const phase = x * 0.4 + z * 0.5;
  animHooks.push((dt, t) => {
    const f1 = Math.sin(t * 14 + phase) * 0.16;
    const f2 = Math.cos(t * 18 + phase) * 0.18;
    core.scale.y = 1 + f1;
    m1.scale.y = 1 + f2;
    m2.scale.y = 1 - f1;
    o1.scale.y = 1 - f2;
    o2.scale.y = 1 + f1 * 1.1;
    tip.position.y = (0.72 + f2 * 0.18) * s;
    tip.position.x = Math.sin(t * 11 + phase) * 0.05 * s;
    for (const sp of sparks) {
      const p = (t * 0.85 + sp.offset) % 1;
      sp.mesh.position.set(
        Math.sin(t * 3.5 + sp.seed) * 0.28 * s,
        (0.55 + p * 0.95) * s,
        Math.cos(t * 3.1 + sp.seed) * 0.28 * s
      );
      sp.mesh.scale.setScalar(Math.max(0.25, 1.0 - p * 0.75));
    }
  });
  return g;
}

// =========================================================================
// 2. 5 GRAPHIC-ARTIST TEXTURED OFFICIAL SKYBOUND RELICS PORTALS
//    (Sky Forest, Sky Beach, Duel Arena, Sky Desert, Sky Dungeon)
// =========================================================================
export function buildDetailedPortal(root, pt, addCollider, animHooks, mats = null, waterMat = null) {
  const g = new THREE.Group();
  g.position.set(pt.x, pt.y, pt.z);
  if (pt.rotY) g.rotation.y = pt.rotY;
  root.add(g);

  const wid = pt.worldId;
  const locked = !pt.unlocked;
  const m = mats || {};

  // Solid side-pillar colliders rotated cleanly with pt.rotY (center 3.1m wide walkway completely open!)
  const rotY = pt.rotY || 0;
  const cR = Math.cos(rotY);
  const sR = Math.sin(rotY);
  addCollider(pt.x - 2.1 * cR, pt.y + 2.4, pt.z + 2.1 * sR, 1.25, 4.8, 1.25);
  addCollider(pt.x + 2.1 * cR, pt.y + 2.4, pt.z - 2.1 * sR, 1.25, 4.8, 1.25);

  function addVortex(cOut, cMid, cCore, cSpark) {
    const oCol = locked ? 0x450a0a : cOut;
    const mCol = locked ? 0x991b1b : cMid;
    const kCol = locked ? 0xfca5a5 : cCore;
    const op = locked ? 0.35 : 0.88;
    const outerMat = new THREE.MeshBasicMaterial({ color: oCol, transparent: true, opacity: op * 0.68 });
    const midMat = new THREE.MeshBasicMaterial({ color: mCol, transparent: true, opacity: op * 0.86 });
    const coreMat = new THREE.MeshBasicMaterial({ color: kCol, transparent: true, opacity: op });
    const mOut = new THREE.Mesh(new THREE.BoxGeometry(2.75, 3.75, 0.14), outerMat);
    mOut.position.set(0, 2.48, 0);
    const mMid = new THREE.Mesh(new THREE.BoxGeometry(1.98, 2.82, 0.22), midMat);
    mMid.position.set(0, 2.48, 0);
    const mCore = new THREE.Mesh(new THREE.BoxGeometry(1.06, 1.72, 0.30), coreMat);
    mCore.position.set(0, 2.48, 0);
    g.add(mOut, mMid, mCore);

    const motes = [];
    if (!locked) {
      for (let i = 0; i < 6; i++) {
        const mt = box(g, 0, 2.5, 0.28, 0.17, 0.17, 0.17, cSpark, { emissive: true });
        motes.push({ mesh: mt, idx: i });
      }
    }
    animHooks.push((dt, t) => {
      const pu = Math.sin(t * 3.6 + pt.x) * 0.07;
      mMid.scale.set(1 + pu, 1 - pu * 0.6, 1);
      mCore.scale.set(1 - pu, 1 + pu, 1);
      outerMat.opacity = locked ? 0.28 : (0.54 + Math.sin(t * 3.2) * 0.14);
      for (const mt of motes) {
        const a = t * 2.2 + mt.idx * (Math.PI / 3);
        mt.mesh.position.set(Math.cos(a) * 0.96, 2.48 + Math.sin(a) * 1.24, (mt.idx % 2 === 0 ? 0.26 : -0.26));
      }
    });
    return mOut;
  }

  let gateMesh;
  if (wid === 'forest') {
    // SKY FOREST — Textured Mossy Stone Dais, Living Oak Archway, Vines, Mushrooms & Layered Canopy!
    box(g, 0, 0.16, 0.15, 6.0, 0.32, 3.4, m.mossyStone || 0x64748b, { tile: 1.4 });
    box(g, 0, 0.42, 0.05, 5.1, 0.22, 2.6, m.stone || 0x94a3b8, { tile: 1.4 });
    box(g, 0, 0.56, 0, 4.3, 0.08, 1.9, 0x22c55e);
    gateMesh = addVortex(0x047857, 0x22c55e, 0xbbf7d0, 0xfef08a);
    for (const sx of [-1.85, 1.85]) {
      const d = sx < 0 ? -1 : 1;
      box(g, sx + d * 0.48, 0.58, 0.46, 0.72, 0.48, 0.56, m.wood || 0x451a03, { ry: 0.3 * d, tile: 1.2 });
      box(g, sx, 1.25, 0, 0.96, 1.25, 0.96, m.wood || 0x5d4037, { tile: 1.2 });
      box(g, sx - d * 0.06, 2.45, 0.04, 0.88, 1.22, 0.88, m.mossyLog || 0x6d4c41, { rz: d * 0.05, tile: 1.2 });
      box(g, sx - d * 0.10, 3.65, -0.02, 0.86, 1.24, 0.86, m.wood || 0x5d4037, { rz: -d * 0.05, tile: 1.2 });
      box(g, sx, 1.85, 0.49, 0.24, 1.10, 0.10, m.leaves || 0x16a34a, { rz: 0.32 * d, tile: 1.0 });
      box(g, sx, 3.05, 0.48, 0.24, 1.15, 0.10, m.leaves || 0x22c55e, { rz: -0.28 * d, tile: 1.0 });
      box(g, sx, 2.15, 0.56, 0.18, 0.18, 0.10, 0xfef08a, { emissive: true });
      box(g, sx + d * 0.96, 0.56, 0.82, 0.18, 0.34, 0.18, 0xfef3c7);
      box(g, sx + d * 0.96, 0.80, 0.82, 0.48, 0.22, 0.48, 0xef4444);
      box(g, sx + d * 1.02, 0.93, 0.90, 0.10, 0.06, 0.10, 0xffffff);
    }
    box(g, 0, 4.48, 0, 4.7, 0.66, 1.02, m.wood || 0x5d4037, { tile: 1.4 });
    box(g, 0, 5.14, 0, 5.6, 0.98, 2.0, m.leaves || 0x15803d, { tile: 1.5 });
    box(g, -1.7, 5.44, 0.25, 2.3, 0.88, 1.8, m.leaves || 0x16a34a, { tile: 1.4 });
    box(g,  1.7, 5.44, -0.20, 2.3, 0.88, 1.8, m.leaves || 0x22c55e, { tile: 1.4 });
    box(g, 0, 5.88, 0.10, 3.1, 0.82, 1.6, m.palmLeaves || 0x4ade80, { tile: 1.4 });
    box(g, 0, 6.32, 0, 1.8, 0.50, 1.15, 0x86efac);
    for (const vx of [-2.4, -1.2, 1.2, 2.4]) box(g, vx, 4.3, 0.78, 0.16, 0.92, 0.14, 0x4ade80);
    box(g, 0, 4.58, 0.62, 0.96, 1.0, 0.24, m.goldStone || 0xfacc15, { tile: 1.0 });
    const tot = oct(g, 0, 4.60, 0.80, 0.28, 1.35, 0xfef08a);
    animHooks.push((dt, t) => { tot.rotation.y = t * 2.0; });
  } else if (wid === 'beach') {
    // SKY BEACH — Animated Caustic Ocean Pool, Textured Sand Dais, Driftwood, Corals, Leaning Palm & Pearl!
    if (waterMat) {
      const poolGeo = new THREE.PlaneGeometry(6.4, 3.8, 12, 8);
      poolGeo.rotateX(-Math.PI / 2);
      const pool = new THREE.Mesh(poolGeo, waterMat);
      pool.position.set(0, 0.26, 0.15);
      g.add(pool);
    } else {
      box(g, 0, 0.14, 0.15, 6.2, 0.28, 3.6, 0x0ea5e9, { emissive: true });
    }
    box(g, 0, 0.44, 0.02, 4.9, 0.30, 2.4, m.sand || 0xfde68a, { tile: 1.5 });
    box(g, 0, 0.62, 0, 4.1, 0.08, 1.82, m.dockPlanks || 0xd97706, { tile: 1.4 });
    gateMesh = addVortex(0x0284c7, 0x22d3ee, 0xe0f2fe, 0xfef08a);
    for (const sx of [-1.82, 1.82]) {
      const d = sx < 0 ? -1 : 1;
      box(g, sx, 2.50, 0, 0.84, 3.68, 0.84, m.dockPlanks || 0xd6b892, { tile: 1.3 });
      box(g, sx, 1.35, 0, 0.96, 0.26, 0.96, m.goldStone || 0xb45309, { tile: 1.0 });
      box(g, sx, 3.40, 0, 0.96, 0.26, 0.96, m.goldStone || 0xb45309, { tile: 1.0 });
      box(g, sx + d * 0.66, 0.88, 0.66, 0.36, 0.72, 0.34, m.coralPink || 0xf472b6, { rz: d * 0.22 });
      box(g, sx + d * 0.90, 0.76, 0.30, 0.28, 0.54, 0.28, m.coralOrange || 0xfb923c, { rz: -d * 0.18 });
      box(g, sx + d * 0.48, 0.72, 0.92, 0.34, 0.10, 0.34, 0xef4444, { ry: 0.4 });
    }
    for (let s = 0; s < 5; s++) {
      box(g, -2.75 - s * 0.16, 0.95 + s * 0.74, -0.15, 0.48 - s * 0.03, 0.76, 0.48 - s * 0.03, m.palmWood || 0x92400e, { rz: 0.18, tile: 1.0 });
    }
    const palmCrown = new THREE.Group();
    palmCrown.position.set(-3.5, 4.65, -0.15);
    g.add(palmCrown);
    for (let i = 0; i < 5; i++) {
      const fa = (i / 5) * Math.PI * 2;
      box(palmCrown, Math.cos(fa) * 0.95, 0, Math.sin(fa) * 0.95, 1.45, 0.16, 0.44, m.palmLeaves || 0x22c55e, { ry: -fa, rz: -0.35, tile: 1.0 });
    }
    box(palmCrown, 0.1, -0.35, 0.2, 0.28, 0.28, 0.28, 0x5d4037);
    box(palmCrown, -0.15, -0.38, -0.12, 0.28, 0.28, 0.28, 0x451a03);
    animHooks.push((dt, t) => { palmCrown.rotation.z = Math.sin(t * 2.1) * 0.06; });
    box(g, 0, 4.52, 0, 4.9, 0.56, 1.0, m.dockPlanks || 0xc4a47c, { tile: 1.4 });
    box(g, 0, 4.94, 0, 3.4, 0.34, 0.84, m.sand || 0xe5cfa8, { tile: 1.4 });
    box(g, 0, 4.88, 0.56, 1.36, 1.02, 0.22, m.coralPink || 0xf9a8d4);
    const pearl = oct(g, 0, 4.88, 0.74, 0.34, 1.0, 0xfef9c3);
    animHooks.push((dt, t) => { pearl.rotation.y = t * 1.6; });
  } else if (wid === 'dungeon') {
    // SKY DUNGEON — Textured Obsidian & Rune-Stone Crypt Arch, Iron Spikes, Chains & Blue Soul-Fire!
    box(g, 0, 0.16, 0.15, 5.9, 0.32, 3.4, m.obsidian || 0x0f172a, { tile: 1.4 });
    box(g, 0, 0.44, 0.05, 5.0, 0.24, 2.6, m.runeStone || 0x1e293b, { tile: 1.4 });
    box(g, 0, 0.60, 0, 4.2, 0.08, 1.95, m.castleDark || 0x334155, { tile: 1.4 });
    gateMesh = addVortex(0x312e81, 0x7c3aed, 0x38bdf8, 0xe879f9);
    for (const sx of [-1.85, 1.85]) {
      const d = sx < 0 ? -1 : 1;
      box(g, sx, 2.58, 0, 1.0, 3.85, 1.02, m.obsidian || 0x1e293b, { tile: 1.2 });
      box(g, sx, 2.58, 0, 1.08, 0.42, 1.08, m.runeStone || 0x4c1d95, { tile: 1.0 });
      box(g, sx, 4.72, 0, 1.24, 0.38, 1.24, m.castleDark || 0x0f172a, { tile: 1.2 });
      box(g, sx + d * 0.68, 2.55, 0.44, 0.48, 0.14, 0.48, 0x0f172a);
      addVoxelFire(g, sx + d * 0.68, 2.64, 0.44, 0.90, animHooks, 'soul');
      for (let c = 0; c < 4; c++) box(g, sx - d * 0.38, 4.0 - c * 0.35, 0.48, 0.12, 0.24, 0.12, 0x94a3b8);
      pyr(g, sx + d * 0.92, 0.98, 0.65, 0.32, 1.18, 0xa855f7, { rx: 0.15, rz: d * 0.2, emissive: true });
    }
    box(g, 0, 5.0, 0, 5.1, 0.68, 1.18, m.obsidian || 0x1e293b, { tile: 1.4 });
    box(g, 0, 5.52, 0, 3.9, 0.46, 0.98, m.runeStone || 0x334155, { tile: 1.4 });
    for (const tx of [-1.05, -0.52, 0, 0.52, 1.05]) pyr(g, tx, 4.38, 0.22, 0.16, 0.66, 0xcbd5e1, { rx: Math.PI });
    box(g, 0, 5.22, 0.68, 0.98, 1.0, 0.36, 0xe2e8f0);
    box(g, -0.22, 5.28, 0.88, 0.20, 0.22, 0.06, 0x38bdf8, { emissive: true });
    box(g,  0.22, 5.28, 0.88, 0.20, 0.22, 0.06, 0x38bdf8, { emissive: true });
    box(g, 0, 4.94, 0.86, 0.44, 0.16, 0.06, 0x0f172a);
  } else if (wid === 'desert') {
    // SKY DESERT — Textured Carved Sandstone Pylons, Lapis-Gold Inlays, Oil Braziers, Cactus & Solar Wings!
    box(g, 0, 0.16, 0.15, 6.0, 0.32, 3.4, m.redRock || 0xd97706, { tile: 1.4 });
    box(g, 0, 0.44, 0.05, 5.1, 0.24, 2.65, m.sandstone || 0xf59e0b, { tile: 1.4 });
    box(g, 0, 0.60, 0, 4.3, 0.08, 2.0, m.goldStone || 0xfde68a, { tile: 1.4 });
    gateMesh = addVortex(0xb45309, 0xf59e0b, 0xfef9c3, 0xfb923c);
    for (const sx of [-1.85, 1.85]) {
      const d = sx < 0 ? -1 : 1;
      box(g, sx, 1.28, 0, 1.16, 1.32, 1.16, m.sandstone || 0xf59e0b, { tile: 1.2 });
      box(g, sx, 2.46, 0, 1.02, 1.20, 1.02, m.sandstone || 0xfbbf24, { tile: 1.2 });
      box(g, sx, 3.58, 0, 0.90, 1.12, 0.90, m.sandstone || 0xf59e0b, { tile: 1.2 });
      box(g, sx, 1.92, 0, 1.10, 0.24, 1.10, 0x1d4ed8);
      box(g, sx, 3.08, 0, 0.98, 0.24, 0.98, 0x1d4ed8);
      box(g, sx, 4.30, 0, 1.20, 0.36, 1.20, m.goldStone || 0xfacc15, { tile: 1.0 });
      box(g, sx + d * 0.96, 0.84, 0.68, 0.58, 0.58, 0.58, m.redRock || 0xb45309, { tile: 1.0 });
      addVoxelFire(g, sx + d * 0.96, 1.14, 0.68, 0.90, animHooks, 'fire');
    }
    box(g, 3.25, 1.18, -0.15, 0.42, 1.64, 0.42, m.cactus || 0x16a34a, { tile: 1.0 });
    box(g, 3.60, 1.28, -0.15, 0.44, 0.26, 0.28, m.cactus || 0x22c55e, { tile: 1.0 });
    box(g, 3.72, 1.58, -0.15, 0.26, 0.54, 0.28, m.cactus || 0x22c55e, { tile: 1.0 });
    box(g, -3.15, 0.64, 0.10, 0.56, 0.72, 0.56, m.redRock || 0xc2410c, { tile: 1.0 });
    box(g, -3.15, 1.08, 0.10, 0.34, 0.22, 0.34, m.goldStone || 0xea580c, { tile: 1.0 });
    box(g, 0, 4.72, 0, 5.4, 0.62, 1.20, m.sandstone || 0xfbbf24, { tile: 1.4 });
    box(g, 0, 5.18, 0, 4.5, 0.34, 1.06, 0x1d4ed8);
    box(g, -1.25, 5.34, 0.58, 1.55, 0.38, 0.16, m.goldStone || 0xfacc15, { rz: 0.12 });
    box(g,  1.25, 5.34, 0.58, 1.55, 0.38, 0.16, m.goldStone || 0xfacc15, { rz: -0.12 });
    const sun = oct(g, 0, 5.38, 0.68, 0.46, 1.0, 0xfef08a);
    animHooks.push((dt, t) => { sun.rotation.y = t * 1.5; });
  } else {
    // DUEL ARENA — Textured Colosseum Columns, Crimson Carpet, War Horns, Banners, Braziers & Crossed Swords!
    box(g, 0, 0.16, 0.15, 6.2, 0.32, 3.5, m.castleDark || 0x1e293b, { tile: 1.4 });
    box(g, 0, 0.44, 0.05, 5.3, 0.24, 2.75, m.stone || 0x475569, { tile: 1.4 });
    box(g, 0, 0.60, 0.25, 3.0, 0.08, 2.7, m.castleCarpet || 0xb91c1c, { tile: 1.4 });
    gateMesh = addVortex(0x991b1b, 0xef4444, 0xfef08a, 0xfb923c);
    for (const sx of [-1.85, 1.85]) {
      const d = sx < 0 ? -1 : 1;
      box(g, sx, 2.52, 0, 1.02, 3.72, 1.02, m.castleDark || 0x334155, { tile: 1.2 });
      for (let r = 0; r < 5; r++) box(g, sx, 1.0 + r * 0.72, 0.54, 0.18, 0.18, 0.08, m.goldStone || 0xf59e0b);
      box(g, sx, 4.50, 0, 1.24, 0.38, 1.24, 0xb91c1c);
      pyr(g, sx * 1.12, 5.14, 0, 0.34, 1.02, 0xe2e8f0, { rz: -d * 0.32 });
      box(g, sx + d * 1.52, 2.20, -0.25, 0.16, 3.9, 0.16, 0x475569);
      box(g, sx + d * 1.52, 3.20, -0.05, 0.90, 1.75, 0.08, m.castleCarpet || 0xdc2626, { tile: 1.2 });
      box(g, sx + d * 1.52, 3.20, 0.02, 0.32, 0.88, 0.06, 0xfacc15, { emissive: true });
      box(g, sx + d * 0.96, 0.92, 0.78, 0.66, 0.76, 0.66, m.forgeBrick || 0x1e293b, { tile: 1.0 });
      box(g, sx + d * 0.96, 1.38, 0.78, 0.86, 0.24, 0.86, m.castleDark || 0x334155, { tile: 1.0 });
      addVoxelFire(g, sx + d * 0.96, 1.52, 0.78, 1.08, animHooks, 'fire');
    }
    box(g, 0, 4.82, 0, 5.2, 0.66, 1.20, m.castleDark || 0x1e293b, { tile: 1.4 });
    box(g, 0, 5.30, 0, 3.9, 0.40, 1.0, 0x991b1b);
    box(g, 0, 5.22, 0.66, 0.28, 2.8, 0.14, 0xf1f5f9, { rz: 0.785 });
    box(g, 0, 5.22, 0.66, 0.28, 2.8, 0.14, 0xf1f5f9, { rz: -0.785 });
    box(g, -0.64, 4.55, 0.70, 0.68, 0.16, 0.18, m.goldStone || 0xfacc15, { rz: -0.785 });
    box(g,  0.64, 4.55, 0.70, 0.68, 0.16, 0.18, m.goldStone || 0xfacc15, { rz: 0.785 });
    box(g, 0, 5.22, 0.80, 0.92, 1.10, 0.18, 0xb91c1c);
    const gem = oct(g, 0, 5.22, 0.95, 0.30, 1.3, 0xfde047);
    animHooks.push((dt, t) => { gem.rotation.y = t * 2.0; });
  }

  return gateMesh;
}

// =========================================================================
// 3. GRAND WALK-IN / WALK-OUT SKYBOUND CITADEL MEGA-CASTLE (44m x 34m x 36m!)
//    100% 32x32 Textured Masonry, Cobalt Shingle Roofs, PERMANENT SOARING
//    15.5m VAULTED CATHEDRAL CEILING (Roof ALWAYS visible inside & out!),
//    Hanging Chandeliers, Stained Glass, Castle Front Moats & Cozy Firelight!
// =========================================================================
export function buildWalkInMegaCastle(root, mats, addBlock, addCollider, animHooks, cx = 0, cy = 0, cz = -30, waterMat = null, waterZones = null) {
  const castle = new THREE.Group();
  castle.position.set(cx, cy, cz);
  root.add(castle);

  const W = 44, D = 34, H = 15.5;
  const mStone = mats.castleStone || 0xe2e8f0;
  const mDark = mats.castleDark || 0x475569;
  const mRoof = mats.castleRoof || 0x1d4ed8;
  const mTimber = mats.castleTimber || 0x5c3419;
  const mGold = mats.goldStone || 0xfacc15;
  const mGlass = mats.stainedGlass || 0x38bdf8;
  const mBooks = mats.bookshelf || 0x6d4c41;

  // 1. Flush Sky-Marble Interior Floor + Textured Crimson-Gold Royal Carpet (zero ankle clip!)
  const floorGeo = new THREE.PlaneGeometry(W - 1.6, D - 1.6);
  floorGeo.rotateX(-Math.PI / 2);
  const fUv = floorGeo.attributes.uv;
  for (let i = 0; i < fUv.count; i++) fUv.setXY(i, fUv.getX(i) * ((W - 1.6) / 2.2), fUv.getY(i) * ((D - 1.6) / 2.2));
  fUv.needsUpdate = true;
  const fMat = mats.skyMarble.clone();
  fMat.polygonOffset = true; fMat.polygonOffsetFactor = -3; fMat.polygonOffsetUnits = -3;
  const fMesh = new THREE.Mesh(floorGeo, fMat);
  fMesh.position.set(0, 0.02, 0); fMesh.receiveShadow = true;
  castle.add(fMesh);

  const carpetGeo = new THREE.PlaneGeometry(6.2, D + 4.0);
  carpetGeo.rotateX(-Math.PI / 2);
  const cUv = carpetGeo.attributes.uv;
  for (let i = 0; i < cUv.count; i++) cUv.setXY(i, cUv.getX(i) * 1.0, cUv.getY(i) * 8.0);
  cUv.needsUpdate = true;
  const cMat = (mats.castleCarpet || new THREE.MeshLambertMaterial({ color: 0xb91c1c })).clone();
  cMat.polygonOffset = true; cMat.polygonOffsetFactor = -4; cMat.polygonOffsetUnits = -4;
  const carpet = new THREE.Mesh(carpetGeo, cMat);
  carpet.position.set(0, 0.03, 2.5); carpet.receiveShadow = true;
  castle.add(carpet);

  function wall(lx, ly, lz, w, h, d, mat, col = true, tile = 2.0) {
    box(castle, lx, ly, lz, w, h, d, mat, { tile });
    if (col) addCollider(cx + lx, cy + ly, cz + lz, w, h, d);
  }

  // --- FRONT TRIPLE-ARCH WALK-IN GATEHOUSE WALL (lz = +17.0, 9.5m tall Center Arch!) ---
  // Center Open Archway: lx in [-4.8, +4.8] (9.6m wide x 9.6m tall — huge cathedral entry!)
  // Side Open Archways: lx in [-13.6, -9.6] and [+9.6, +13.6] (4.0m wide x 6.8m tall!)
  wall(-17.8, H / 2, 17, 8.4, H, 2.0, mStone);
  wall( 17.8, H / 2, 17, 8.4, H, 2.0, mStone);
  wall(-7.2,  H / 2, 17, 4.8, H, 2.2, mDark);
  wall( 7.2,  H / 2, 17, 4.8, H, 2.2, mDark);
  // High arched lintels + gold trim + upper front stained-glass rose window (strictly inset below ceiling deck for zero Z-fighting!)
  wall(0, 12.56, 17, 9.6, 5.72, 2.3, mStone, false);
  wall(-11.6, 11.16, 17, 4.0, 8.52, 2.0, mStone, false);
  wall( 11.6, 11.16, 17, 4.0, 8.52, 2.0, mStone, false);
  box(castle, 0, 9.8, 18.25, 10.4, 0.65, 0.45, mGold, { tile: 1.5 });
  box(castle, 0, 12.6, 18.22, 4.6, 4.0, 0.25, mGlass, { tile: 2.0 });
  box(castle, -7.2, 6.4, 18.25, 2.2, 6.2, 0.16, 0x1d4ed8);
  box(castle,  7.2, 6.4, 18.25, 2.2, 6.2, 0.16, 0x1d4ed8);
  box(castle, -7.2, 6.4, 18.36, 0.7, 3.8, 0.08, 0xfacc15, { emissive: true });
  box(castle,  7.2, 6.4, 18.36, 0.7, 3.8, 0.08, 0xfacc15, { emissive: true });
  // Fortified Stone Plinth Base & Battlement Crenellations along Front Wall!
  box(castle, -17.8, 0.85, 18.15, 8.6, 1.7, 0.6, mDark, { tile: 1.8 });
  box(castle,  17.8, 0.85, 18.15, 8.6, 1.7, 0.6, mDark, { tile: 1.8 });
  for (let mx = -19; mx <= 19; mx += 3.2) {
    box(castle, mx, H + 0.9, 17.3, 1.7, 1.8, 1.6, mStone, { tile: 1.4 });
  }

  // --- REAR SANCTUARY WALL (lz = -17.0) + Soaring 3-Panel Cathedral Stained Glass ---
  wall(0, H / 2, -17, W, H, 2.0, mStone);
  box(castle, 0, 1.0, -15.8, W - 2.0, 2.0, 0.6, mDark, { tile: 2.0 });
  for (const wx of [-9.5, 0, 9.5]) {
    const ww = wx === 0 ? 7.6 : 4.4;
    const wh = wx === 0 ? 9.2 : 7.4;
    box(castle, wx, 8.6, -15.9, ww + 1.0, wh + 1.0, 0.35, mGold, { tile: 1.5 });
    box(castle, wx, 8.6, -15.65, ww, wh, 0.20, mGlass, { tile: 2.4 });
  }

  // --- WEST & EAST SIDE WALLS WITH 6.5m WALK-OUT COURTYARD EXITS & CLERESTORY WINDOWS ---
  for (const sx of [-22, 22]) {
    const d = sx < 0 ? -1 : 1;
    wall(sx, H / 2, -10.2, 2.0, H, 13.6, mStone);
    wall(sx, H / 2,  10.2, 2.0, H, 13.6, mStone);
    wall(sx, 11.4, 0, 2.2, 8.2, 7.0, mStone, false);
    box(castle, sx - d * 1.05, 7.4, 0, 0.35, 0.55, 7.2, mGold, { tile: 1.4 });
    // Exterior Stone Buttresses + Glowing Side Cathedral Windows (visible inside & outside!)
    for (const bz of [-13, -6, 6, 13]) {
      box(castle, sx + d * 1.35, H * 0.48, bz, 1.2, H * 0.96, 1.6, mDark, { tile: 1.8 });
    }
    for (const wz of [-10.2, 10.2]) {
      box(castle, sx - d * 0.95, 9.8, wz, 0.22, 4.8, 3.4, mGlass, { tile: 2.0 });
      box(castle, sx + d * 0.95, 9.8, wz, 0.22, 4.8, 3.4, mGlass, { tile: 2.0 });
    }
  }

  // --- 6 MONUMENTAL SKY-SPIRE TOWERS (Textured Stone + Cobalt Shingle Spires + Battlements!) ---
  const towers = [
    [-7.2, 18.6, 20.5, 4.8, 0x38bdf8],
    [ 7.2, 18.6, 20.5, 4.8, 0x38bdf8],
    [-22.2, -17.2, 18.5, 6.0, 0x5cd6a8],
    [ 22.2, -17.2, 18.5, 6.0, 0x5cd6a8],
    [-22.2,  17.2, 18.5, 6.0, 0x5cd6a8],
    [ 22.2,  17.2, 18.5, 6.0, 0x5cd6a8],
  ];
  for (const [tx, tz, th, tw, gCol] of towers) {
    wall(tx, th / 2, tz, tw, th, tw, mStone, true, 2.0);
    box(castle, tx, 1.1, tz, tw + 0.5, 2.2, tw + 0.5, mDark, { tile: 1.8 });
    box(castle, tx, th * 0.52, tz, tw + 0.35, 0.7, tw + 0.35, mGold, { tile: 1.5 });
    box(castle, tx, th + 0.6, tz, tw + 1.1, 1.2, tw + 1.1, mDark, { tile: 1.6 });
    // Glowing arched tower window on front/sides
    box(castle, tx, th * 0.72, tz + tw * 0.51, 1.2, 2.4, 0.14, mGlass, { tile: 1.5 });
    pyr(castle, tx, th + 4.8, tz, tw * 0.76, 7.6, mRoof);
    const apex = oct(castle, tx, th + 9.4, tz, 0.78, 1.45, gCol);
    animHooks.push((dt, t) => { apex.rotation.y = t * 1.8; });
  }

  // --- PERMANENT SOARING CATHEDRAL ROOF, VAULTED RAFTERS & HANGING CHANDELIERS! ---
  // (ALWAYS VISIBLE inside & outside — zero missing roof when walking in!)
  const roofGroup = new THREE.Group();
  castle.add(roofGroup);
  // Textured dark timber ceiling deck + exterior cobalt roof + grand central 36m spire!
  box(roofGroup, 0, H + 0.45, 0, W + 1.2, 0.9, D + 1.2, mTimber, { tile: 2.4 });
  box(roofGroup, 0, H + 1.25, 0, W + 1.8, 0.9, D + 1.8, mDark, { tile: 2.2 });
  // Sloped Gothic Cathedral Clerestory & Cobalt Shingle Main Roof
  box(roofGroup, 0, H + 4.2, 0, 26, 5.2, 20, mStone, { tile: 2.0 });
  box(roofGroup, 0, H + 4.2, 10.15, 14, 3.0, 0.25, mGlass, { tile: 2.2 });
  box(roofGroup, 0, H + 4.2, -10.15, 14, 3.0, 0.25, mGlass, { tile: 2.2 });
  pyr(roofGroup, 0, H + 11.2, 0, 19.5, 9.6, mRoof);
  box(roofGroup, 0, H + 16.4, 0, 4.8, 3.2, 4.8, mGold, { tile: 1.6 });
  pyr(roofGroup, 0, H + 20.2, 0, 3.6, 4.8, mRoof);
  const spireCrown = oct(roofGroup, 0, H + 23.6, 0, 1.35, 1.55, 0x38bdf8);
  animHooks.push((dt, t) => { spireCrown.rotation.y = t * 1.4; });

  // Interior Exposed Cathedral Oak Cross-Beams & Vaulted Stone Ribs (visible when looking up inside!)
  for (const rz of [-12, -4, 4, 12]) {
    box(roofGroup, 0, H - 0.55, rz, W - 2.4, 0.95, 0.95, mTimber, { tile: 2.0 });
    box(roofGroup, -10.5, H - 1.55, rz, 1.1, 2.2, 1.1, mGold, { tile: 1.2 });
    box(roofGroup,  10.5, H - 1.55, rz, 1.1, 2.2, 1.1, mGold, { tile: 1.2 });
  }
  // 3 Grand Hanging Golden Cathedral Chandeliers with Live Flickering Voxel Flames!
  for (const chz of [-8, 0, 8]) {
    box(roofGroup, 0, H - 2.2, chz, 0.18, 4.2, 0.18, mDark);
    box(roofGroup, 0, H - 4.3, chz, 4.4, 0.36, 4.4, mGold, { tile: 1.2 });
    box(roofGroup, 0, H - 4.3, chz, 3.2, 0.42, 3.2, mDark);
    for (const [ox, oz] of [[-1.9, -1.9], [1.9, -1.9], [-1.9, 1.9], [1.9, 1.9]]) {
      addVoxelFire(roofGroup, ox, H - 4.05, chz + oz, 0.65, animHooks, 'fire');
    }
  }

  // --- FURNISHED GRAND INTERIOR (Walkable!) ---
  // 1. Towering Fluted Castle Marble Columns (15.4m tall!)
  for (const px of [-10.5, 10.5]) {
    for (const pz of [-10, 0, 10]) {
      wall(px, (H - 0.2) / 2, pz, 1.5, H - 0.2, 1.5, mStone, true, 1.8);
      box(castle, px, 0.55, pz, 2.2, 1.1, 2.2, mDark, { tile: 1.5 });
      box(castle, px, H - 0.7, pz, 2.3, 0.9, 2.3, mGold, { tile: 1.4 });
    }
  }
  // 2. Center Grand Quest War Table + Spinning Cyan Sky-Orrery
  wall(0, 0.68, 0.5, 4.0, 1.36, 2.2, mTimber, true, 1.5);
  box(castle, 0, 1.40, 0.5, 3.4, 0.08, 1.7, 0xfef3c7);
  const orrery = oct(castle, 0, 2.35, 0.5, 0.58, 1.25, 0x38bdf8);
  animHooks.push((dt, t) => { orrery.rotation.y = t * 1.9; orrery.position.y = 2.35 + Math.sin(t * 2.5) * 0.14; });

  // 3. Rear Boss Relic Trophy Pedestal (6 glowing world & boss relics!)
  wall(0, 0.85, -12.5, 11.2, 1.7, 2.5, mStone, true, 1.6);
  box(castle, 0, 1.76, -12.5, 11.6, 0.24, 2.7, mGold, { tile: 1.5 });
  [0x4ade80, 0x2dd4bf, 0x38bdf8, 0xa855f7, 0xf59e0b, 0xef4444].forEach((c, i) => {
    const cr = oct(castle, -4.2 + i * 1.68, 2.50, -12.5, 0.38, 1.45, c);
    animHooks.push((dt, t) => { cr.rotation.y = t * 2.0 + i; });
  });

  // 4. West Interior Wing — Hero Outfit Armor Gallery
  wall(-17.8, 0.3, 0, 2.6, 0.6, 9.6, mTimber, true, 1.6);
  [0x22c55e, 0x0ea5e9, 0xf59e0b].forEach((c, i) => {
    box(castle, -17.8, 1.50, -3.0 + i * 3.0, 0.95, 1.15, 1.25, c);
    box(castle, -17.8, 2.42, -3.0 + i * 3.0, 0.72, 0.68, 0.72, mGold, { tile: 1.0 });
  });

  // 5. East Interior Wing — 32x32 Textured Lore Bookshelves & Arcane Lamps
  for (const bz of [-6.5, 0, 6.5]) {
    wall(18.4, 2.4, bz, 1.5, 4.8, 4.6, mBooks, true, 1.5);
    box(castle, 18.4, 4.95, bz, 1.7, 0.35, 4.8, mTimber, { tile: 1.6 });
    box(castle, 18.4, 5.45, bz, 0.65, 0.65, 0.65, 0x38bdf8, { emissive: true });
  }

  // 6. 4 Interior Blazing Castle Braziers + Warm Golden Interior PointLight!
  for (const bx of [-13.0, 13.0]) {
    for (const bz of [-11.5, 11.5]) {
      wall(bx, 0.95, bz, 1.3, 1.9, 1.3, mDark, true, 1.2);
      addVoxelFire(castle, bx, 1.96, bz, 1.32, animHooks, 'fire');
    }
  }
  const hallLight = new THREE.PointLight(0xffcf78, 1.8, 48, 1.4);
  hallLight.position.set(0, 11.5, -1.0);
  castle.add(hallLight);

  // 7. Twin Decorative Front Reflecting Water Moats flanking the Castle Approach!
  //    Solid stone-and-gold curbs prevent walking through the ponds, & registered in waterZones for weapon splashes!
  if (waterMat) {
    for (const mx of [-14.8, 14.8]) {
      // Recessed dark slate basin floor so translucent caustic water looks deep & crystal-clear
      box(castle, mx, 0.05, 25.2, 11.5, 0.10, 4.5, mDark, { tile: 1.8 });
      // Sculpted Stone Curb + Gold Rim framing each reflecting pond (solid barrier!)
      box(castle, mx, 0.30, 22.8, 12.4, 0.60, 0.58, mDark, { tile: 1.4 });
      box(castle, mx, 0.30, 27.6, 12.4, 0.60, 0.58, mDark, { tile: 1.4 });
      box(castle, mx - 5.95, 0.30, 25.2, 0.58, 0.60, 5.38, mDark, { tile: 1.4 });
      box(castle, mx + 5.95, 0.30, 25.2, 0.58, 0.60, 5.38, mDark, { tile: 1.4 });
      box(castle, mx, 0.64, 22.8, 12.5, 0.10, 0.64, mGold, { tile: 1.4 });
      box(castle, mx, 0.64, 27.6, 12.5, 0.10, 0.64, mGold, { tile: 1.4 });
      box(castle, mx - 5.95, 0.64, 25.2, 0.64, 0.10, 5.42, mGold, { tile: 1.4 });
      box(castle, mx + 5.95, 0.64, 25.2, 0.64, 0.10, 5.42, mGold, { tile: 1.4 });
      // Solid collider blocking walking straight through the reflecting pond!
      addCollider(cx + mx, cy + 0.48, cz + 25.2, 12.4, 0.96, 5.4);
      const poolGeo = new THREE.PlaneGeometry(11.4, 4.4, 14, 8);
      poolGeo.rotateX(-Math.PI / 2);
      const pool = new THREE.Mesh(poolGeo, waterMat);
      pool.position.set(mx, 0.44, 25.2);
      castle.add(pool);
      if (waterZones) {
        waterZones.push({
          minX: cx + mx - 5.8, maxX: cx + mx + 5.8,
          minZ: cz + 25.2 - 2.3, maxZ: cz + 25.2 + 2.3,
          y: cy + 0.46,
        });
      }
      // Glowing floating lily-crystal lantern in each moat
      const lan = oct(castle, mx, 0.88, 25.2, 0.42, 1.2, 0x38bdf8);
      animHooks.push((dt, t) => { lan.rotation.y = t * 1.5; lan.position.y = 0.88 + Math.sin(t * 2.4 + mx) * 0.1; });
    }
  }

  return { castle, roofGroup, interiorBounds: { minX: cx - W / 2, maxX: cx + W / 2, minZ: cz - D / 2, maxZ: cz + D / 2, ceilingY: cy + H } };
}

// =========================================================================
// 4. GRAND TEXTURED BLACKSMITH FORGE & WEAPON STORE BUILDINGS
// =========================================================================
export function buildBlacksmithForgeBuilding(root, addCollider, animHooks, x, y, z, mats = null, waterMat = null, waterZones = null) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  root.add(g);
  const m = mats || {};

  box(g, 0, 0.18, 0, 8.0, 0.36, 6.6, m.castleDark || 0x64748b, { tile: 1.5 });
  for (const [px, pz] of [[-3.4, -2.7], [3.4, -2.7], [-3.4, 2.7], [3.4, 2.7]]) {
    box(g, px, 2.2, pz, 0.52, 3.8, 0.52, m.castleTimber || 0x5d4037, { tile: 1.2 });
    addCollider(x + px, y + 2.2, z + pz, 0.55, 3.8, 0.55);
  }
  box(g, 0, 4.25, 0, 8.8, 0.50, 7.2, m.forgeRoof || 0x7c2d12, { rx: 0.08, tile: 1.6 });
  // Molten Basalt Furnace + Chimney + Roaring Fire + Warm Forge PointLight!
  box(g, -1.6, 1.75, -1.7, 3.2, 2.9, 2.0, m.forgeBrick || 0x334155, { tile: 1.4 });
  addCollider(x - 1.6, y + 1.75, z - 1.7, 3.2, 2.9, 2.0);
  box(g, -1.6, 1.38, -0.66, 1.9, 1.25, 0.22, 0xfb923c, { emissive: true });
  addVoxelFire(g, -1.6, 1.0, -0.45, 1.22, animHooks, 'fire');
  box(g, -1.6, 5.0, -1.8, 1.4, 3.4, 1.4, m.forgeBrick || 0x1e293b, { tile: 1.3 });
  box(g, -1.6, 6.8, -1.8, 1.1, 0.30, 1.1, 0xf97316, { emissive: true });
  const forgeLight = new THREE.PointLight(0xff8c2a, 1.6, 18, 1.6);
  forgeLight.position.set(-1.2, 2.2, 0.6);
  g.add(forgeLight);
  // Heavy Iron Upgrade Anvil + Glowing Blade + Animated Water Quench Trough!
  box(g, 1.2, 0.68, 0.4, 1.45, 0.68, 0.88, m.castleDark || 0x1e293b, { tile: 1.0 });
  box(g, 1.2, 1.24, 0.4, 1.95, 0.44, 0.88, m.stone || 0x475569, { tile: 1.0 });
  box(g, 1.2, 1.52, 0.4, 1.25, 0.14, 0.28, 0x38bdf8, { emissive: true });
  addCollider(x + 1.2, y + 0.8, z + 0.4, 1.85, 1.5, 0.9);
  box(g, 2.7, 0.92, -1.4, 1.1, 1.24, 1.1, m.castleTimber || 0x6d4c41, { tile: 1.0 });
  if (waterMat) {
    const qGeo = new THREE.PlaneGeometry(0.92, 0.92, 4, 4);
    qGeo.rotateX(-Math.PI / 2);
    const qMesh = new THREE.Mesh(qGeo, waterMat);
    qMesh.position.set(2.7, 1.56, -1.4);
    g.add(qMesh);
    if (waterZones) {
      waterZones.push({ minX: x + 2.2, maxX: x + 3.2, minZ: z - 1.9, maxZ: z - 0.9, y: y + 1.58 });
    }
  } else {
    box(g, 2.7, 1.56, -1.4, 0.88, 0.08, 0.88, 0x38bdf8, { emissive: true });
  }
}

export function buildWeaponStoreBuilding(root, addCollider, animHooks, x, y, z, mats = null) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  root.add(g);
  const m = mats || {};

  box(g, 0, 0.18, 0, 8.6, 0.36, 6.4, m.skyMarble || 0xe2e8f0, { tile: 1.6 });
  box(g, 0, 2.15, -2.55, 7.8, 3.5, 0.60, m.dockPlanks || 0x92400e, { tile: 1.5 });
  addCollider(x, y + 2.15, z - 2.55, 7.8, 3.5, 0.65);
  box(g, -3.65, 2.15, 0, 0.60, 3.5, 5.4, m.castleTimber || 0x78350f, { tile: 1.5 });
  box(g,  3.65, 2.15, 0, 0.60, 3.5, 5.4, m.castleTimber || 0x78350f, { tile: 1.5 });
  addCollider(x - 3.65, y + 2.15, z, 0.65, 3.5, 5.4);
  addCollider(x + 3.65, y + 2.15, z, 0.65, 3.5, 5.4);
  // Wide Front Sales Counter + Glowing Potions & Gold Coin Pile
  box(g, 0, 0.98, 2.0, 6.4, 1.28, 1.15, m.dockPlanks || 0xb45309, { tile: 1.4 });
  box(g, 0, 1.66, 2.0, 6.7, 0.20, 1.36, m.goldStone || 0xfde68a, { tile: 1.4 });
  addCollider(x, y + 0.98, z + 2.0, 6.5, 1.6, 1.25);
  box(g, -2.1, 1.98, 2.0, 0.38, 0.50, 0.38, 0xef4444, { emissive: true });
  box(g,  2.1, 1.98, 2.0, 0.38, 0.50, 0.38, 0x38bdf8, { emissive: true });
  box(g,  0.0, 1.90, 2.0, 0.64, 0.30, 0.44, m.goldStone || 0xfacc15, { tile: 0.8 });
  // Striped Royal Sky-Blue & Gold Awning Canopy
  for (let i = -2; i <= 2; i++) {
    box(g, i * 1.72, 4.18, 0.35, 1.68, 0.36, 7.0, (i + 2) % 2 === 0 ? (m.castleRoof || 0x2563eb) : (m.goldStone || 0xfacc15), { rx: 0.12, tile: 1.6 });
  }
  // Floating Glowing Sword Signboard + Wall Mounted Weapons
  box(g, 0, 5.2, 2.85, 3.8, 1.0, 0.30, m.castleDark || 0x1e293b, { tile: 1.4 });
  box(g, 0, 5.2, 3.04, 2.5, 0.22, 0.10, 0x38bdf8, { emissive: true });
  box(g, -0.7, 5.2, 3.04, 0.22, 0.68, 0.10, 0xfacc15, { emissive: true });
  box(g, -1.9, 2.45, -2.15, 0.26, 2.0, 0.14, 0x5cd6a8, { emissive: true, rz: 0.12 });
  box(g,  0.0, 2.45, -2.15, 0.30, 1.9, 0.14, 0x38bdf8, { emissive: true });
  box(g,  1.9, 2.45, -2.15, 0.74, 0.62, 0.30, 0xfb923c, { emissive: true });
}

// =========================================================================
// 5. GRAND 3-TIER ANIMATED CAUSTIC WATER FOUNTAIN + ARCING WATER JETS!
// =========================================================================
export function buildGrandFountain(root, addCollider, animHooks, x, y, z, mats = null, waterMat = null, waterZones = null) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  root.add(g);
  const m = mats || {};
  const mStone = m.castleStone || 0xcbd5e1;
  const mDark = m.castleDark || 0x334155;
  const mGold = m.goldStone || 0xfacc15;

  // Recessed dark slate basin floor (so animated caustic water matches the deep blue Castle Reflecting Ponds!)
  box(g, 0, 0.14, 0, 7.2, 0.28, 7.2, mDark, { tile: 1.8 });

  // 4 Open Sculpted Marble Basin Rim Walls + Gold Rim Rails (hollow center = ZERO gold clipping through water!)
  box(g, 0, 0.48, -3.72, 8.2, 0.96, 0.76, mStone, { tile: 1.6 });
  box(g, 0, 0.48,  3.72, 8.2, 0.96, 0.76, mStone, { tile: 1.6 });
  box(g, -3.72, 0.48, 0, 0.76, 0.96, 6.72, mStone, { tile: 1.6 });
  box(g,  3.72, 0.48, 0, 0.76, 0.96, 6.72, mStone, { tile: 1.6 });
  box(g, 0, 1.01, -3.72, 8.36, 0.12, 0.86, mGold, { tile: 1.6 });
  box(g, 0, 1.01,  3.72, 8.36, 0.12, 0.86, mGold, { tile: 1.6 });
  box(g, -3.72, 1.01, 0, 0.86, 0.12, 6.66, mGold, { tile: 1.6 });
  box(g,  3.72, 1.01, 0, 0.86, 0.12, 6.66, mGold, { tile: 1.6 });
  addCollider(x, y + 0.52, z, 8.2, 1.06, 8.2);

  // Upper Tier Hollow Basin Rim + Recessed Floor
  box(g, 0, 1.80, 0, 2.5, 2.1, 2.5, m.skyMarble || 0xe2e8f0, { tile: 1.4 });
  box(g, 0, 2.90, 0, 3.8, 0.24, 3.8, mDark, { tile: 1.4 });
  box(g, 0, 3.16, -1.78, 4.0, 0.42, 0.42, mStone, { tile: 1.4 });
  box(g, 0, 3.16,  1.78, 4.0, 0.42, 0.42, mStone, { tile: 1.4 });
  box(g, -1.78, 3.16, 0, 0.42, 0.42, 3.16, mStone, { tile: 1.4 });
  box(g,  1.78, 3.16, 0, 0.42, 0.42, 3.16, mStone, { tile: 1.4 });
  box(g, 0, 3.40, -1.78, 4.1, 0.08, 0.48, mGold, { tile: 1.4 });
  box(g, 0, 3.40,  1.78, 4.1, 0.08, 0.48, mGold, { tile: 1.4 });
  box(g, -1.78, 3.40, 0, 0.48, 0.08, 3.14, mGold, { tile: 1.4 });
  box(g,  1.78, 3.40, 0, 0.48, 0.08, 3.14, mGold, { tile: 1.4 });

  if (waterMat) {
    const lowW = new THREE.PlaneGeometry(6.75, 6.75, 16, 16);
    lowW.rotateX(-Math.PI / 2);
    const lowMesh = new THREE.Mesh(lowW, waterMat);
    lowMesh.position.set(0, 0.78, 0);
    g.add(lowMesh);

    const hiW = new THREE.PlaneGeometry(3.15, 3.15, 10, 10);
    hiW.rotateX(-Math.PI / 2);
    const hiMesh = new THREE.Mesh(hiW, waterMat);
    hiMesh.position.set(0, 3.24, 0);
    g.add(hiMesh);
  } else {
    box(g, 0, 0.76, 0, 6.75, 0.14, 6.75, 0x06b6d4, { emissive: true });
    box(g, 0, 3.22, 0, 3.15, 0.12, 3.15, 0x38bdf8, { emissive: true });
  }

  if (waterZones) {
    waterZones.push({ minX: x - 3.45, maxX: x + 3.45, minZ: z - 3.45, maxZ: z + 3.45, y: y + 0.80 });
    waterZones.push({ minX: x - 1.65, maxX: x + 1.65, minZ: z - 1.65, maxZ: z + 1.65, y: y + 3.26 });
  }

  box(g, 0, 4.20, 0, 1.25, 1.9, 1.25, m.skyMarble || 0xf8fafc, { tile: 1.2 });
  box(g, 0, 5.18, 0, 1.55, 0.24, 1.55, mGold, { tile: 1.2 });

  // Animated cascading water droplets falling from upper basin into lower pool!
  const drops = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const dm = box(g, Math.cos(a) * 1.9, 2.5, Math.sin(a) * 1.9, 0.22, 0.34, 0.22, i % 2 === 0 ? 0x7dd3fc : 0xe0f2fe, { emissive: true });
    drops.push({ mesh: dm, ang: a, phase: (i % 4) * 0.25 });
  }
  const orb = oct(g, 0, 6.25, 0, 1.0, 1.45, 0x38bdf8);
  animHooks.push((dt, t) => {
    orb.rotation.y = t * 1.6;
    orb.position.y = 6.25 + Math.sin(t * 2.6) * 0.22;
    for (const dr of drops) {
      const p = (t * 1.25 + dr.phase) % 1;
      const rad = 1.65 + p * 1.45;
      const dy = 3.25 - p * p * 2.30;
      dr.mesh.position.set(Math.cos(dr.ang) * rad, dy, Math.sin(dr.ang) * rad);
      dr.mesh.scale.setScalar(0.75 + (1 - p) * 0.45);
    }
  });
}

// =========================================================================
// 6. HIGH-DETAIL TEXTURED WORLD PROPS & LANDMARK STRUCTURES
// =========================================================================
export function buildDetailedWorldProp(root, p, addCollider, animHooks, worldId, mats = null) {
  const g = new THREE.Group();
  g.position.set(p.x, p.y, p.z);
  if (p.rot) g.rotation.y = p.rot;
  root.add(g);
  const m = mats || {};

  if (p.kind === 'brazier') {
    box(g, 0, 0.14, 0, 1.40, 0.28, 1.40, m.castleDark || 0x64748b, { tile: 1.0 });
    box(g, 0, 0.36, 0, 1.12, 0.20, 1.12, m.stone || 0x94a3b8, { tile: 1.0 });
    for (const cx of [-0.42, 0.42]) for (const cz of [-0.42, 0.42]) box(g, cx, 0.85, cz, 0.18, 0.78, 0.18, 0x1e293b);
    box(g, 0, 1.36, 0, 1.40, 0.32, 1.40, m.forgeBrick || 0x1e293b, { tile: 1.0 });
    addCollider(p.x, p.y + 0.8, p.z, 1.38, 1.6, 1.38);
    addVoxelFire(g, 0, 1.54, 0, 1.30, animHooks, worldId === 'dungeon' ? 'soul' : 'fire');
    return true;
  }
  if (p.kind === 'campfire') {
    box(g, 0, 0.04, 0, 1.65, 0.08, 1.65, 0x27272a);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      box(g, Math.cos(a) * 0.94, 0.16, Math.sin(a) * 0.94, 0.44, 0.32, 0.38, i % 2 === 0 ? (m.stone || 0x64748b) : (m.castleDark || 0x94a3b8), { ry: a, tile: 0.9 });
    }
    for (let k = 0; k < 3; k++) box(g, 0, 0.20, 0, 1.30, 0.20, 0.22, m.wood || 0x451a03, { ry: k * 1.04, rz: 0.12, tile: 0.8 });
    box(g, -1.15, 0.85, 0, 0.14, 1.7, 0.14, m.castleTimber || 0x6d4c41);
    box(g,  1.15, 0.85, 0, 0.14, 1.7, 0.14, m.castleTimber || 0x6d4c41);
    box(g, 0, 1.68, 0, 2.5, 0.12, 0.12, m.castleTimber || 0x5d4037);
    box(g, 0, 1.08, 0, 0.56, 0.42, 0.56, 0x1e293b);
    box(g, 0, 1.30, 0, 0.44, 0.08, 0.44, 0x4ade80, { emissive: true });
    addCollider(p.x, p.y + 0.5, p.z, 1.8, 1.0, 1.8);
    addVoxelFire(g, 0, 0.25, 0, 1.05, animHooks, 'fire');
    return true;
  }
  if (p.kind === 'stoneWall') {
    const wMat = worldId === 'desert' ? (m.sandstone || 0xf59e0b) : worldId === 'dungeon' ? (m.obsidian || 0x1e293b) : (m.castleStone || 0xcbd5e1);
    const bMat = worldId === 'desert' ? (m.redRock || 0xb45309) : (m.castleDark || 0x475569);
    box(g, 0, 0.24, 0, 4.4, 0.48, 1.15, bMat, { tile: 1.4 });
    box(g, 0, 1.44, 0, 4.2, 1.95, 0.92, wMat, { tile: 1.4 });
    for (const mx of [-1.45, 0, 1.45]) box(g, mx, 2.66, 0, 0.88, 0.52, 0.98, wMat, { tile: 1.2 });
    box(g, 0, 1.54, 0.54, 0.28, 0.44, 0.10, 0x1e293b);
    box(g, 0, 1.58, 0.76, 0.16, 0.72, 0.16, m.castleTimber || 0x6d4c41, { rx: 0.22 });
    addVoxelFire(g, 0, 1.98, 0.86, 0.75, animHooks, worldId === 'dungeon' ? 'soul' : 'fire');
    const rot = p.rot || 0;
    const bw = Math.abs(Math.cos(rot)) * 4.3 + Math.abs(Math.sin(rot)) * 1.1;
    const bd = Math.abs(Math.sin(rot)) * 4.3 + Math.abs(Math.cos(rot)) * 1.1;
    addCollider(p.x, p.y + 1.3, p.z, bw, 2.7, bd);
    return true;
  }
  if (p.kind === 'noticeBoard') {
    box(g, -1.2, 1.25, 0, 0.24, 2.5, 0.24, m.castleTimber || 0x5d4037);
    box(g,  1.2, 1.25, 0, 0.24, 2.5, 0.24, m.castleTimber || 0x5d4037);
    box(g, 0, 1.45, 0, 2.25, 1.48, 0.18, m.dockPlanks || 0x8d6e63, { tile: 1.2 });
    box(g, 0, 2.48, 0, 2.9, 0.28, 0.82, m.forgeRoof || 0x7c2d12, { rx: 0.18, tile: 1.2 });
    box(g, -0.62, 1.65, 0.12, 0.46, 0.56, 0.04, 0xfef3c7);
    box(g,  0.04, 1.55, 0.12, 0.52, 0.62, 0.04, 0xfffbeb);
    box(g,  0.66, 1.32, 0.12, 0.44, 0.50, 0.04, 0xfef3c7);
    box(g, 1.55, 1.80, 0, 0.30, 0.38, 0.30, 0xfde047, { emissive: true });
    addCollider(p.x, p.y + 1.2, p.z, 2.4, 2.4, 0.6);
    return true;
  }
  if (p.kind === 'banner') {
    box(g, 0, 0.16, 0, 1.0, 0.32, 1.0, m.castleDark || 0x64748b, { tile: 1.0 });
    box(g, 0, 1.98, 0, 0.16, 3.5, 0.16, 0x475569);
    pyr(g, 0, 3.90, 0, 0.22, 0.54, 0xfacc15, { emissive: true });
    box(g, 0, 3.34, 0.10, 1.55, 0.14, 0.14, m.goldStone || 0xf59e0b);
    box(g, 0, 2.28, 0.14, 1.20, 1.98, 0.08, p.color || 0x1d4ed8);
    oct(g, 0, 2.34, 0.22, 0.30, 1.3, 0xfacc15);
    addCollider(p.x, p.y + 1.5, p.z, 0.9, 3.0, 0.9);
    return true;
  }
  if (p.kind === 'barrelStack') {
    box(g, -0.6, 0.55, 0, 1.12, 1.12, 1.12, m.dockPlanks || 0x8d6e63, { ry: 0.14, tile: 1.0 });
    box(g, -0.6, 1.06, 0, 1.18, 0.14, 1.18, m.castleTimber || 0x5d4037, { ry: 0.14 });
    box(g,  0.65, 0.58, 0.12, 0.88, 1.18, 0.88, m.wood || 0x6d4c41, { tile: 1.0 });
    box(g,  0.65, 0.26, 0.12, 0.94, 0.12, 0.94, 0x1e293b);
    box(g,  0.65, 0.88, 0.12, 0.94, 0.12, 0.94, 0x1e293b);
    addCollider(p.x, p.y + 0.6, p.z, 2.2, 1.2, 1.2);
    return true;
  }
  if (p.kind === 'worldLandmark') {
    if (worldId === 'forest') {
      box(g, 0, 1.5, 0, 1.9, 3.0, 1.9, m.wood || 0x6d4c41, { tile: 1.4 });
      box(g, 0, 3.1, 0, 4.0, 0.38, 4.0, m.dockPlanks || 0x8d6e63, { tile: 1.4 });
      box(g, 0, 4.35, 0, 2.9, 2.1, 2.7, m.dockPlanks || 0xa16207, { tile: 1.4 });
      box(g, 0, 4.25, 1.40, 0.82, 0.98, 0.12, 0xfde047, { emissive: true });
      box(g, 0, 5.9, 0, 4.5, 1.4, 4.2, m.leaves || 0x16a34a, { tile: 1.6 });
      box(g, 0, 7.0, 0, 2.8, 1.0, 2.7, m.palmLeaves || 0x4ade80, { tile: 1.4 });
      addCollider(p.x, p.y + 3.0, p.z, 3.8, 6.2, 3.8);
    } else if (worldId === 'beach') {
      box(g, 0, 0.42, 0, 4.6, 0.84, 4.6, m.sand || 0xfde68a, { tile: 1.5 });
      box(g, 0, 1.75, 0, 2.7, 1.85, 2.7, m.castleStone || 0xf8fafc, { tile: 1.4 });
      box(g, 0, 3.18, 0, 2.5, 1.02, 2.5, m.castleCarpet || 0xef4444, { tile: 1.4 });
      box(g, 0, 4.20, 0, 2.3, 1.02, 2.3, m.castleStone || 0xf8fafc, { tile: 1.4 });
      box(g, 0, 5.35, 0, 1.7, 1.25, 1.7, 0xfef08a, { emissive: true });
      pyr(g, 0, 6.60, 0, 1.8, 1.5, m.forgeRoof || 0xef4444);
      addCollider(p.x, p.y + 3.0, p.z, 3.6, 6.2, 3.6);
    } else if (worldId === 'desert') {
      box(g, 0, 0.52, 0, 6.6, 1.04, 6.6, m.redRock || 0xd97706, { tile: 1.6 });
      box(g, 0, 1.56, 0, 5.4, 1.04, 5.4, m.sandstone || 0xf59e0b, { tile: 1.6 });
      box(g, 0, 2.60, 0, 4.2, 1.04, 4.2, m.sandstone || 0xfbbf24, { tile: 1.5 });
      box(g, 0, 3.64, 0, 3.0, 1.04, 3.0, 0x1d4ed8);
      pyr(g, 0, 5.00, 0, 2.0, 1.9, m.goldStone || 0xfacc15);
      addCollider(p.x, p.y + 2.2, p.z, 6.4, 4.5, 6.4);
    } else {
      box(g, 0, 0.42, 0, 3.6, 0.84, 3.6, m.obsidian || 0x1e293b, { tile: 1.4 });
      box(g, 0, 2.85, 0, 1.7, 4.1, 1.7, m.runeStone || 0x475569, { tile: 1.4 });
      box(g, 0, 2.25, 0, 2.6, 0.28, 2.6, 0x7c3aed, { emissive: true });
      box(g, 0, 3.45, 0, 2.3, 0.28, 2.3, 0x38bdf8, { emissive: true });
      const orb = oct(g, 0, 5.8, 0, 0.78, 1.38, 0x38bdf8);
      animHooks.push((dt, t) => { orb.rotation.y = t * 2.2; });
      addCollider(p.x, p.y + 2.5, p.z, 3.3, 5.2, 3.3);
    }
    return true;
  }
  return false;
}

// =========================================================================
// 7. COMPLETE FORTIFIED SAFE HAVEN OUTER PERIMETER CURTAIN WALLS & 4 TOWERS!
//    Fully encloses Cloud Safe Haven (x = ±62, z = -58 .. +58) with stone
//    battlements, corner watchtowers, blazing wall torches & solid colliders!
// =========================================================================
export function buildSafeHavenPerimeterWalls(root, mats, addCollider, animHooks) {
  const g = new THREE.Group();
  root.add(g);
  const m = mats || {};
  const mStone = m.castleStone || 0xcbd5e1;
  const mDark = m.castleDark || 0x475569;
  const mRoof = m.castleRoof || 0x1d4ed8;
  const mGold = m.goldStone || 0xfacc15;
  const mTimber = m.castleTimber || 0x6d4c41;

  const X = 62;
  const Z = 58;
  const wallH = 4.2;
  const wallT = 1.9;

  function addSegment(cx, cz, len, alongX, hasArchGap = false) {
    if (hasArchGap) {
      // Split into two halves with a scenic 12m overlook balustrade in the center!
      const half = (len - 12) / 2;
      const off = 6 + half / 2;
      if (alongX) {
        addSegment(cx - off, cz, half, true, false);
        addSegment(cx + off, cz, half, true, false);
        // Scenic waist-high balustrade overlook + golden archway pillars
        box(g, cx, 0.72, cz, 12.2, 1.44, 1.4, mStone, { tile: 1.8 });
        box(g, cx, 1.50, cz, 12.4, 0.16, 1.55, mGold, { tile: 1.6 });
        addCollider(cx, 1.0, cz, 12.4, 2.0, 1.6);
        for (const px of [cx - 6.0, cx + 6.0]) {
          box(g, px, 3.0, cz, 2.2, 6.0, 2.2, mDark, { tile: 1.6 });
          box(g, px, 6.15, cz, 2.5, 0.32, 2.5, mGold, { tile: 1.4 });
          addVoxelFire(g, px, 6.38, cz, 1.0, animHooks, 'fire');
          addCollider(px, 3.0, cz, 2.3, 6.0, 2.3);
        }
      } else {
        addSegment(cx, cz - off, half, false, false);
        addSegment(cx, cz + off, half, false, false);
        box(g, cx, 0.72, cz, 1.4, 1.44, 12.2, mStone, { tile: 1.8 });
        box(g, cx, 1.50, cz, 1.55, 0.16, 12.4, mGold, { tile: 1.6 });
        addCollider(cx, 1.0, cz, 1.6, 2.0, 12.4);
        for (const pz of [cz - 6.0, cz + 6.0]) {
          box(g, cx, 3.0, pz, 2.2, 6.0, 2.2, mDark, { tile: 1.6 });
          box(g, cx, 6.15, pz, 2.5, 0.32, 2.5, mGold, { tile: 1.4 });
          addVoxelFire(g, cx, 6.38, pz, 1.0, animHooks, 'fire');
          addCollider(cx, 3.0, pz, 2.3, 6.0, 2.3);
        }
      }
      return;
    }

    const w = alongX ? len : wallT;
    const d = alongX ? wallT : len;
    // Plinth + Stone Curtain Wall + Walkway Ledge
    box(g, cx, 0.55, cz, alongX ? len : wallT + 0.45, 1.1, alongX ? wallT + 0.45 : len, mDark, { tile: 2.2 });
    box(g, cx, wallH / 2 + 0.3, cz, w, wallH - 0.6, d, mStone, { tile: 2.2 });
    box(g, cx, wallH + 0.12, cz, alongX ? len : wallT + 0.25, 0.24, alongX ? wallT + 0.25 : len, mGold, { tile: 2.0 });
    addCollider(cx, wallH / 2, cz, w + 0.2, wallH + 0.8, d + 0.2);

    // Battlement Merlons & Blazing Wall Torches facing inward!
    const step = 4.0;
    const count = Math.max(1, Math.floor((len - 2.0) / step));
    const start = -((count - 1) * step) / 2;
    const inwardSign = alongX ? (cz > 0 ? -1 : 1) : (cx > 0 ? -1 : 1);
    for (let i = 0; i < count; i++) {
      const p = start + i * step;
      const mx = alongX ? cx + p : cx;
      const mz = alongX ? cz : cz + p;
      box(g, mx, wallH + 0.68, mz, alongX ? 1.7 : wallT + 0.12, 0.92, alongX ? wallT + 0.12 : 1.7, mStone, { tile: 1.4 });
      if (i % 4 === 1) {
        const tx = alongX ? mx : mx + inwardSign * (wallT * 0.5 + 0.35);
        const tz = alongX ? mz + inwardSign * (wallT * 0.5 + 0.35) : mz;
        box(g, tx, 2.5, tz, 0.22, 0.85, 0.22, mTimber);
        addVoxelFire(g, tx, 2.98, tz, 0.72, animHooks, 'fire');
      }
    }
  }

  // Complete 4-Sided Outer Wall Perimeter (North, South, West, East — ZERO unfinished gaps!)
  addSegment(0, -Z, X * 2 - 6, true, false);  // Solid North Wall behind Mega-Castle
  addSegment(0,  Z, X * 2 - 6, true, true);   // South Wall with Grand Overlook Balustrade
  addSegment(-X, 0, Z * 2 - 6, false, true);  // West Wall with Scenic Sky Overlook
  addSegment( X, 0, Z * 2 - 6, false, true);  // East Wall with Scenic Sky Overlook

  // 4 Monumental Corner Watchtowers framing the entire Safe Haven Citadel!
  for (const [tx, tz] of [[-X, -Z], [X, -Z], [-X, Z], [X, Z]]) {
    const th = 11.2;
    const tw = 6.2;
    box(g, tx, 1.0, tz, tw + 0.6, 2.0, tw + 0.6, mDark, { tile: 1.8 });
    box(g, tx, th / 2, tz, tw, th, tw, mStone, { tile: 2.0 });
    box(g, tx, th * 0.55, tz, tw + 0.35, 0.55, tw + 0.35, mGold, { tile: 1.5 });
    box(g, tx, th + 0.55, tz, tw + 1.0, 1.1, tw + 1.0, mDark, { tile: 1.6 });
    pyr(g, tx, th + 4.2, tz, tw * 0.75, 6.2, mRoof);
    const tip = oct(g, tx, th + 7.9, tz, 0.68, 1.35, 0x38bdf8);
    animHooks.push((dt, t) => { tip.rotation.y = t * 1.6 + tx; });
    addCollider(tx, th / 2, tz, tw + 0.3, th, tw + 0.3);
  }
}
