import * as THREE from '../lib/three.module.min.js';
import { buildWeaponMesh } from './combat.js';
import { makeCharacterTextures } from './textures.js';
import { createStylizedWaterMaterial } from './skyAndWater.js';
import { audio } from './audio.js';
import {
  resetHdAssetCache,
  addVoxelFire,
  buildDetailedPortal,
  buildWalkInMegaCastle,
  buildBlacksmithForgeBuilding,
  buildWeaponStoreBuilding,
  buildGrandFountain,
  buildDetailedWorldProp,
  buildSafeHavenPerimeterWalls,
} from './hdAssets.js';

function makeFloatingLabel(text, color = '#ffffff', width = 256, scaleX = 4.2) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = 56;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(2, 6, 23, 0.84)';
  ctx.fillRect(6, 8, width - 12, 40);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 10, width - 16, 36);
  ctx.fillStyle = color;
  ctx.font = 'bold 22px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, 29);

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  sprite.scale.set(scaleX, 0.9, 1);
  return sprite;
}

function makeNpcMarker(char, color = '#facc15') {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
  ctx.beginPath();
  ctx.arc(32, 32, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = 'bold 34px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(char, 32, 34);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  sp.scale.set(1.0, 1.0, 1);
  return sp;
}

export function buildLevelWorld(scene, mats, levelDef, openedChests = {}) {
  const root = new THREE.Group();
  scene.add(root);

  const colliders = [];
  const movingPlatforms = [];
  const spikeTraps = [];
  const spinners = [];
  const crumbleBlocks = [];
  const crushers = [];
  const hazardZones = [];
  const pendulums = [];
  const turrets = [];
  const turretOrbs = [];
  const portals = [];
  const chests = [];
  const checkpoints = [];
  const friendlyNpcs = [];
  const roamingAi = [];
  const clouds = [];
  const dustMotes = [];
  const swayFoliage = [];
  const sparkles = [];
  const waterZones = [];
  const waterRipples = [];
  let lastSplashSfx = 0;
  const torches = [];
  const animHooks = [];
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const waterMat = createStylizedWaterMaterial(levelDef.worldId || 'haven');
  let castleInteriorBounds = null;

  // Shimmering Stylized Sky-Ocean beneath Sky Beach & Sparkling Pond Streams in Sky Forest!
  if (levelDef.worldId === 'beach') {
    const seaGeo = new THREE.PlaneGeometry(240, 260, 24, 24);
    seaGeo.rotateX(-Math.PI / 2);
    const seaMesh = new THREE.Mesh(seaGeo, waterMat);
    seaMesh.position.set(0, -6.2, -45);
    root.add(seaMesh);
    waterZones.push({ minX: -120, maxX: 120, minZ: -175, maxZ: 85, y: -6.15 });
  }

  const matMap = {
    grass: mats.grassBlock, dirt: mats.dirt, stone: mats.stone, moss: mats.mossyStone,
    ruin: mats.ruinBrick, gold: mats.goldStone, sand: mats.sand, dock: mats.dockPlanks,
    sandstone: mats.sandstone, redRock: mats.redRock, obsidian: mats.obsidian, rune: mats.runeStone,
    cloud: mats.cloudBlock, cloudSub: mats.cloudSub, skyMarble: mats.skyMarble,
  };

  function addCollider(x, y, z, w, h, d) {
    const col = {
      minX: x - w / 2, maxX: x + w / 2,
      minY: y - h / 2, maxY: y + h / 2,
      minZ: z - d / 2, maxZ: z + d / 2,
      isBounce: false,
      bounceVel: 17.8,
    };
    colliders.push(col);
    return col;
  }

  function addBlock(x, y, z, w, h, d, mat, opts = {}) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const uv = geo.attributes.uv;
    if (w !== 1 || h !== 1 || d !== 1) {
      const scales = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
      for (let f = 0; f < 6; f++) {
        const [su, sv] = scales[f];
        for (let i = 0; i < 4; i++) {
          const idx = f * 4 + i;
          uv.setXY(idx, uv.getX(idx) * su, uv.getY(idx) * sv);
        }
      }
      uv.needsUpdate = true;
    }

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = opts.shadow !== false;
    mesh.receiveShadow = true;
    (opts.parent || root).add(mesh);

    if (opts.solid !== false) {
      const col = {
        minX: x - w / 2, maxX: x + w / 2,
        minY: y - h / 2, maxY: y + h / 2,
        minZ: z - d / 2, maxZ: z + d / 2,
        isBounce: !!opts.isBounce,
        bounceVel: opts.bounceVel || 17.8,
      };
      colliders.push(col);
      return { mesh, col };
    }
    return { mesh, col: null };
  }

  function addIsland(isl) {
    const topM = matMap[isl.top] || mats.grassBlock;
    const subM = matMap[isl.sub] || mats.dirt;
    const rockM = matMap[isl.rock] || mats.stone;

    if (isl.thin) {
      // Paper-flat flush floor inlay (ZERO ankle/boot slicing, ZERO Z-fighting!)
      const geo = new THREE.PlaneGeometry(isl.w, isl.d);
      geo.rotateX(-Math.PI / 2);
      const uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        uv.setXY(i, uv.getX(i) * isl.w, uv.getY(i) * isl.d);
      }
      uv.needsUpdate = true;
      const baseMat = Array.isArray(topM) ? topM[2] : topM;
      const inlayMat = baseMat.clone();
      inlayMat.polygonOffset = true;
      const layer = isl.layer || 2;
      inlayMat.polygonOffsetFactor = -layer;
      inlayMat.polygonOffsetUnits = -layer;
      const mesh = new THREE.Mesh(geo, inlayMat);
      mesh.position.set(isl.x, isl.y, isl.z);
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      root.add(mesh);
      return;
    }

    // Main platform block + cleanly separated tapered underside layers (0.015 gaps eliminate coplanar Z-fighting!)
    addBlock(isl.x, isl.y - 0.5, isl.z, isl.w, 1.0, isl.d, topM);
    if (isl.w >= 6 && isl.d >= 6) {
      addBlock(isl.x, isl.y - 1.52, isl.z, isl.w - 1.8, 1.0, isl.d - 1.8, subM, { solid: false, shadow: false });
      addBlock(isl.x, isl.y - 3.04, isl.z, Math.max(3, isl.w - 4.2), 2.0, Math.max(3, isl.d - 4.2), rockM, { solid: false, shadow: false });
      addBlock(isl.x, isl.y - 4.76, isl.z, Math.max(2, isl.w - 7.5), 1.6, Math.max(2, isl.d - 7.5), rockM, { solid: false, shadow: false });
    } else {
      addBlock(isl.x, isl.y - 1.44, isl.z, Math.max(1.5, isl.w - 0.9), 0.84, Math.max(1.5, isl.d - 0.9), rockM, { solid: false, shadow: false });
    }
  }

  // Props with wind-swaying canopies & HD graphic-artist textured voxel details!
  function addProp(p) {
    if (buildDetailedWorldProp(root, p, addCollider, animHooks, levelDef.worldId, mats)) return;
    if (p.kind === 'oak') {
      // HD Oak Tree with flared roots, moss fleck & 3-tier swaying canopy!
      addBlock(p.x, p.y + 1.45, p.z, 0.92, 2.9, 0.92, mats.wood);
      addBlock(p.x - 0.52, p.y + 0.25, p.z, 0.5, 0.5, 0.45, mats.wood, { solid: false });
      addBlock(p.x + 0.52, p.y + 0.25, p.z, 0.5, 0.5, 0.45, mats.wood, { solid: false });
      const canopy = new THREE.Group();
      canopy.position.set(p.x, p.y + 2.6, p.z);
      root.add(canopy);
      addBlock(0, 0.78, 0, 3.2, 1.45, 3.2, mats.leaves, { solid: false, parent: canopy });
      addBlock(0.55, 1.45, -0.35, 2.0, 1.1, 2.0, mats.bushLeaves, { solid: false, parent: canopy });
      addBlock(-0.4, 2.0, 0.25, 1.85, 0.95, 1.85, mats.leaves, { solid: false, parent: canopy });
      swayFoliage.push({ group: canopy, phase: p.x * 0.3 + p.z * 0.2, amp: 0.055 });
    } else if (p.kind === 'palm') {
      addBlock(p.x, p.y + 1.2, p.z, 0.72, 2.4, 0.72, mats.palmWood);
      const crown = new THREE.Group();
      crown.position.set(p.x + 0.2, p.y + 2.3, p.z);
      root.add(crown);
      addBlock(0.1, 0.85, 0, 0.65, 1.7, 0.65, mats.palmWood, { solid: false, parent: crown });
      addBlock(0.15, 1.8, 0, 3.8, 0.55, 0.95, mats.palmLeaves, { solid: false, parent: crown });
      addBlock(0.15, 1.8, 0, 0.95, 0.55, 3.8, mats.palmLeaves, { solid: false, parent: crown });
      addBlock(0.42, 1.35, 0.25, 0.34, 0.34, 0.34, mats.wood, { solid: false, parent: crown });
      addBlock(-0.15, 1.32, -0.25, 0.34, 0.34, 0.34, mats.wood, { solid: false, parent: crown });
      swayFoliage.push({ group: crown, phase: p.x * 0.4 + p.z * 0.2, amp: 0.08 });
    } else if (p.kind === 'cactus') {
      addBlock(p.x, p.y + 1.4, p.z, 0.85, 2.8, 0.85, mats.cactus);
      addBlock(p.x + 0.75, p.y + 1.5, p.z, 0.65, 0.5, 0.65, mats.cactus, { solid: false });
      addBlock(p.x + 0.9, p.y + 2.1, p.z, 0.5, 1.0, 0.5, mats.cactus, { solid: false });
      addBlock(p.x - 0.75, p.y + 1.1, p.z, 0.65, 0.5, 0.65, mats.cactus, { solid: false });
      addBlock(p.x - 0.9, p.y + 1.7, p.z, 0.5, 1.0, 0.5, mats.cactus, { solid: false });
    } else if (p.kind === 'torch') {
      // Upgraded HD Standing Torch Pillar with Riveted Bowl & Live 4-Layer Voxel Fire!
      addBlock(p.x, p.y + 1.05, p.z, 0.82, 2.1, 0.82, mats.runeStone);
      addBlock(p.x, p.y + 2.18, p.z, 1.08, 0.22, 1.08, mats.obsidian, { solid: false });
      addVoxelFire(root, p.x, p.y + 2.30, p.z, 1.05, animHooks, levelDef.worldId === 'dungeon' ? 'soul' : 'fire');
    } else if (p.kind === 'grassTuft') {
      const g = new THREE.Group();
      g.position.set(p.x, p.y, p.z);
      root.add(g);
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.65, 0.14), mats.tallGrass);
      b1.position.set(-0.18, 0.32, 0.08); b1.rotation.z = 0.22;
      const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.82, 0.14), mats.tallGrass);
      b2.position.set(0.04, 0.41, -0.06);
      const b3 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.58, 0.14), mats.tallGrass);
      b3.position.set(0.22, 0.29, 0.12); b3.rotation.z = -0.25;
      const flMat = ((Math.abs(Math.round(p.x + p.z)) % 3) === 0) ? mats.flowerGold : ((Math.abs(Math.round(p.x)) % 2) === 0 ? mats.flowerRose : mats.flowerSky);
      const fl = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.2, 0.26), flMat);
      fl.position.set(0.04, 0.86, -0.06);
      g.add(b1, b2, b3, fl);
      swayFoliage.push({ group: g, phase: p.x * 0.7 + p.z * 0.5, amp: 0.12 });
    } else if (p.kind === 'bush') {
      const g = new THREE.Group();
      g.position.set(p.x, p.y, p.z);
      root.add(g);
      addBlock(0, 0.45, 0, 1.5, 0.9, 1.5, mats.leaves, { solid: false, parent: g });
      addBlock(0.35, 0.85, 0.2, 0.9, 0.6, 0.9, mats.bushLeaves, { solid: false, parent: g });
      const berry = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.24), mats.flowerRose);
      berry.position.set(-0.45, 0.75, 0.58);
      const berry2 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), mats.flowerGold);
      berry2.position.set(0.55, 0.65, -0.45);
      g.add(berry, berry2);
      addCollider(p.x, p.y + 0.45, p.z, 1.35, 0.9, 1.35);
      swayFoliage.push({ group: g, phase: p.x * 0.4 + p.z, amp: 0.045 });
    } else if (p.kind === 'log') {
      const rot = p.rot || 0.35;
      const g = new THREE.Group();
      g.position.set(p.x, p.y, p.z);
      g.rotation.y = rot;
      root.add(g);
      addBlock(0, 0.38, 0, 2.7, 0.72, 0.78, mats.mossyLog, { solid: false, parent: g });
      const stem = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.16), mats.mushroomStem);
      stem.position.set(0.55, 0.82, 0.1);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.38), mats.mushroomCap);
      cap.position.set(0.55, 0.98, 0.1);
      g.add(stem, cap);
      // Solid rotated-footprint collider so player stops against or jumps cleanly onto fallen logs!
      const bw = Math.abs(Math.cos(rot)) * 2.55 + Math.abs(Math.sin(rot)) * 0.75;
      const bd = Math.abs(Math.sin(rot)) * 2.55 + Math.abs(Math.cos(rot)) * 0.75;
      addCollider(p.x, p.y + 0.38, p.z, bw, 0.74, bd);
    } else if (p.kind === 'stump') {
      addBlock(p.x, p.y + 0.48, p.z, 1.05, 0.96, 1.05, mats.wood);
      addBlock(p.x, p.y + 0.98, p.z, 0.82, 0.08, 0.82, mats.dockPlanks, { solid: false });
      const sprout = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.35, 0.18), mats.tallGrass);
      sprout.position.set(p.x + 0.32, p.y + 1.15, p.z - 0.15);
      root.add(sprout);
    } else if (p.kind === 'stoneCluster') {
      const g = new THREE.Group();
      g.position.set(p.x, p.y, p.z);
      g.rotation.y = p.rot || 0.4;
      root.add(g);
      const sMat = levelDef.worldId === 'desert' ? mats.sandstone : levelDef.worldId === 'dungeon' ? mats.obsidian : mats.mossyStone;
      addBlock(-0.35, 0.48, 0.1, 1.15, 0.95, 1.05, sMat, { solid: false, parent: g });
      addBlock(0.55, 0.34, -0.25, 0.85, 0.68, 0.8, mats.stone, { solid: false, parent: g });
      addBlock(0.15, 0.24, 0.62, 0.62, 0.48, 0.62, sMat, { solid: false, parent: g });
      addCollider(p.x, p.y + 0.48, p.z, 1.65, 0.96, 1.55);
    } else if (p.kind === 'coral') {
      const g = new THREE.Group();
      g.position.set(p.x, p.y, p.z);
      g.rotation.y = p.rot || 0.2;
      root.add(g);
      const palette = [mats.coralPink, mats.coralTeal, mats.coralOrange];
      const m1 = palette[Math.abs(Math.round(p.x + p.z)) % 3];
      const m2 = palette[(Math.abs(Math.round(p.x + p.z)) + 1) % 3];
      addBlock(0, 0.55, 0, 0.38, 1.1, 0.38, m1, { solid: false, parent: g });
      addBlock(-0.42, 0.72, 0.1, 0.55, 0.32, 0.32, m1, { solid: false, parent: g });
      addBlock(-0.56, 1.05, 0.1, 0.3, 0.55, 0.3, m1, { solid: false, parent: g });
      addBlock(0.45, 0.45, -0.22, 0.32, 0.9, 0.32, m2, { solid: false, parent: g });
      addBlock(0.65, 0.78, -0.22, 0.42, 0.28, 0.28, m2, { solid: false, parent: g });
      addCollider(p.x, p.y + 0.6, p.z, 1.35, 1.2, 0.95);
    } else if (p.kind === 'crystal') {
      const g = new THREE.Group();
      g.position.set(p.x, p.y, p.z);
      root.add(g);
      const cMat = (Math.abs(Math.round(p.x)) % 2 === 0) ? mats.crystalCyan : mats.crystalViolet;
      const s1 = new THREE.Mesh(new THREE.OctahedronGeometry(0.48, 0), cMat);
      s1.scale.set(0.65, 1.9, 0.65); s1.position.set(0, 0.78, 0);
      const s2 = new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 0), cMat);
      s2.scale.set(0.6, 1.5, 0.6); s2.position.set(0.45, 0.52, 0.18); s2.rotation.z = -0.35;
      const s3 = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), cMat);
      s3.scale.set(0.6, 1.35, 0.6); s3.position.set(-0.42, 0.46, -0.2); s3.rotation.z = 0.38;
      g.add(s1, s2, s3);
      // Solid collider around glowing diamonds / crystals so player never walks through them!
      addCollider(p.x, p.y + 0.8, p.z, 1.15, 1.6, 0.95);
    } else if (p.kind === 'lantern') {
      addBlock(p.x, p.y + 1.45, p.z, 0.42, 2.9, 0.42, mats.skyMarble);
      addBlock(p.x, p.y + 2.98, p.z, 0.78, 0.22, 0.78, mats.goldStone, { solid: false });
      const orb = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.32, 0),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      orb.position.set(p.x, p.y + 3.42, p.z);
      root.add(orb);
      torches.push(orb);
    }
  }

  for (const isl of levelDef.islands) {
    addIsland(isl);
    if (isl.checkpoint) {
      addBlock(isl.x, isl.y + 0.4, isl.z + isl.d * 0.35, 0.7, 0.8, 0.7, mats.mossyStone);
      const crystalMat = new THREE.MeshLambertMaterial({ color: 0x64748b, emissive: 0x1e293b, emissiveIntensity: 0.5 });
      const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 0), crystalMat);
      orb.position.set(isl.x, isl.y + 1.35, isl.z + isl.d * 0.35);
      root.add(orb);
      checkpoints.push({ pos: new THREE.Vector3(isl.x, isl.y + 1.1, isl.z + isl.d * 0.35), orb, mat: crystalMat, name: isl.checkpoint, active: false });
    }
  }

  for (const p of levelDef.props || []) addProp(p);
  for (const pl of levelDef.pillars || []) {
    addBlock(pl[0], pl[1] + pl[3] / 2, pl[2], 1.15, pl[3], 1.15, matMap[pl[4]] || mats.ruinBrick);
  }
  for (const jp of levelDef.jumpPads || []) {
    addBlock(jp[0], jp[1] + 0.16, jp[2], 2.0, 0.28, 2.0, mats.jumpPad, { isBounce: true, bounceVel: jp[3] || 17.8 });
  }

  // Complete Fortified Safe Haven Outer Perimeter Curtain Walls & 4 Corner Watchtowers
  if (levelDef.perimeterWalls) {
    buildSafeHavenPerimeterWalls(root, mats, addCollider, animHooks);
  }

  // Walk-In / Walk-Out Grand Skybound Citadel Mega-Castle (PERMANENT Full Cathedral Roof + 15.5m Vaulted Interior + Chandeliers!)
  if (levelDef.megaCastle) {
    const mc = levelDef.megaCastle;
    const built = buildWalkInMegaCastle(root, mats, addBlock, addCollider, animHooks, mc.x, mc.y, mc.z, waterMat, waterZones);
    castleInteriorBounds = built.interiorBounds;
    const castleLbl = makeFloatingLabel('GRAND SKYBOUND CITADEL', '#38bdf8', 384, 6.4);
    castleLbl.position.set(mc.x, mc.y + 18.0, mc.z + 17.5);
    root.add(castleLbl);
  }

  // Safe Haven Grand 3-Tier Animated Caustic Water Fountain
  if (levelDef.fountain) {
    const f = levelDef.fountain;
    buildGrandFountain(root, addCollider, animHooks, f.x, f.y, f.z, mats, waterMat, waterZones);
  }

  // Grand Blacksmith Torin Textured Weapon Upgrade Forge Building
  if (levelDef.blacksmithForge) {
    const bf = levelDef.blacksmithForge;
    buildBlacksmithForgeBuilding(root, addCollider, animHooks, bf.x, bf.y, bf.z, mats, waterMat, waterZones);
    const bfLbl = makeFloatingLabel('BLACKSMITH FORGE', '#fb923c', 320, 4.8);
    bfLbl.position.set(bf.x, bf.y + 5.8, bf.z);
    root.add(bfLbl);
  }

  // Talkable Safe Haven NPCs (32x32 Pixel-Art Shaded Tunics, Boots, Capes, Arms & Dual Held Gear!)
  for (const npc of levelDef.npcs || []) {
    const g = new THREE.Group();
    g.position.set(npc.x, npc.y, npc.z);
    const robeHex = '#' + npc.robeColor.toString(16).padStart(6, '0');
    const hatHex = '#' + npc.hatColor.toString(16).padStart(6, '0');
    const cTex = makeCharacterTextures(robeHex, hatHex, '#3b2416');
    const mRobe = new THREE.MeshLambertMaterial({ map: cTex.tunicTex });
    const mSleeve = new THREE.MeshLambertMaterial({ map: cTex.sleeveTex });
    const mBoots = new THREE.MeshLambertMaterial({ map: cTex.bootTex });
    const mCape = new THREE.MeshLambertMaterial({ map: cTex.capeTex });
    const mSkin = new THREE.MeshLambertMaterial({ color: 0xffd4ae });
    const mHat = new THREE.MeshLambertMaterial({ color: npc.hatColor });
    const mDark = new THREE.MeshLambertMaterial({ color: 0x1e293b });

    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.46, 0.24), mBoots);
    legL.position.set(-0.13, 0.23, 0);
    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.46, 0.24), mBoots);
    legR.position.set(0.13, 0.23, 0);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.62, 0.36), mRobe);
    body.position.y = 0.74;
    const cape = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.60, 0.08), mCape);
    cape.position.set(0, 0.74, -0.22);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.44, 0.44), mSkin);
    head.position.y = 1.26;
    const hat = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.14, 0.60), mHat);
    hat.position.y = 1.52;
    const hatTop = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.16, 0.44), mHat);
    hatTop.position.y = 1.64;
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.06), mDark);
    eyeL.position.set(-0.1, 1.28, 0.21);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.06), mDark);
    eyeR.position.set(0.1, 1.28, 0.21);

    // Proper Detailed 3D Shoulder Pauldrons, Textured Sleeves & Skin-Toned Hands on ALL Safe Haven NPCs!
    const shL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.24), mHat);
    shL.position.set(-0.39, 0.94, 0);
    const shR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.24), mHat);
    shR.position.set(0.39, 0.94, 0);
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.18), mSleeve);
    armL.position.set(-0.38, 0.72, 0.04);
    const handL = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.16, 0.17), npc.id === 'smith' ? mDark : mSkin);
    handL.position.set(-0.38, 0.49, 0.08);
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.18), mSleeve);
    armR.position.set(0.38, 0.72, 0.08);
    const handR = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.16, 0.17), npc.id === 'smith' ? mDark : mSkin);
    handR.position.set(0.38, 0.49, 0.14);

    // Iconic Held Items on BOTH Hands for ALL 5 Safe Haven NPCs
    if (npc.id === 'elder') {
      const staff = buildWeaponMesh('spear', 4);
      staff.position.set(0.38, 0.56, 0.22);
      const scroll = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.14), new THREE.MeshLambertMaterial({ color: 0xfef3c7 }));
      scroll.position.set(-0.38, 0.52, 0.22);
      const beard = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.12), new THREE.MeshLambertMaterial({ color: 0xf1f5f9 }));
      beard.position.set(0, 1.06, 0.22);
      g.add(staff, scroll, beard);
    } else if (npc.id === 'merchant') {
      const blade = buildWeaponMesh('sword', 3);
      blade.position.set(0.38, 0.56, 0.22);
      const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.22, 0.18), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      pouch.position.set(-0.38, 0.46, 0.20);
      g.add(blade, pouch);
    } else if (npc.id === 'guildmaster') {
      const lance = buildWeaponMesh('dragon_lance', 4);
      lance.position.set(0.38, 0.56, 0.22);
      const tome = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.10), new THREE.MeshLambertMaterial({ color: 0x38bdf8 }));
      tome.position.set(-0.38, 0.52, 0.20);
      g.add(lance, tome);
    } else if (npc.id === 'smith') {
      const hammer = buildWeaponMesh('titan_axe', 5);
      hammer.position.set(0.38, 0.56, 0.22);
      const ingot = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.10, 0.14), new THREE.MeshBasicMaterial({ color: 0xfb923c }));
      ingot.position.set(-0.38, 0.52, 0.22);
      const beard = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.20, 0.12), new THREE.MeshLambertMaterial({ color: 0x7c2d12 }));
      beard.position.set(0, 1.08, 0.22);
      g.add(hammer, ingot, beard);
    } else if (npc.id === 'arenamaster') {
      const blade = buildWeaponMesh('sunblade', 6);
      blade.position.set(0.38, 0.56, 0.22);
      const shield = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.64, 0.46), new THREE.MeshLambertMaterial({ color: 0xb91c1c }));
      shield.position.set(-0.48, 0.62, 0.16);
      g.add(blade, shield);
    }

    const lbl = makeFloatingLabel(`${npc.name}`, '#facc15', 256, 3.6);
    lbl.position.set(0, 2.30, 0);
    const marker = makeNpcMarker(npc.marker || '!', '#facc15');
    marker.position.set(0, 3.10, 0);

    g.add(legL, legR, body, cape, head, hat, hatTop, eyeL, eyeR, shL, shR, armL, handL, armR, handR, lbl, marker);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    root.add(g);

    // Solid NPC body collider so players don't walk through NPCs!
    addCollider(npc.x, npc.y + 0.85, npc.z, 0.72, 1.7, 0.72);
    friendlyNpcs.push({ ...npc, group: g, marker, pos: new THREE.Vector3(npc.x, npc.y + 0.9, npc.z) });
  }

  // Roaming AI NPC Explorers in Expanded 500-Player Grand Safe Haven (32x32 Textured RPG Outfits!)
  const havenWaypoints = [
    [-14, 12], [14, 12], [-12, -4], [12, -4], [0, -14], [0, -22], [-18, 22], [18, 22],
    [-20, 10], [20, 10], [-14, 28], [14, 28], [0, 24], [-8, 16], [8, 16],
  ];
  for (const ap of levelDef.roamingAiPlayers || []) {
    const g = new THREE.Group();
    g.position.set(ap.spawnX, 0.008, ap.spawnZ);
    const tHex = '#' + ap.tunic.toString(16).padStart(6, '0');
    const cHex = '#' + ap.cape.toString(16).padStart(6, '0');
    const cTex = makeCharacterTextures(tHex, cHex, '#3b2416');
    const mTunic = new THREE.MeshLambertMaterial({ map: cTex.tunicTex });
    const mSleeve = new THREE.MeshLambertMaterial({ map: cTex.sleeveTex });
    const mBoots = new THREE.MeshLambertMaterial({ map: cTex.bootTex });
    const mCape = new THREE.MeshLambertMaterial({ map: cTex.capeTex });
    const mSkin = new THREE.MeshLambertMaterial({ color: ap.skin });
    const mHat = new THREE.MeshLambertMaterial({ color: ap.hatColor });
    const mDark = new THREE.MeshLambertMaterial({ color: 0x1e293b });

    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.45, 0.22), mBoots);
    legL.position.set(-0.14, 0.22, 0);
    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.45, 0.22), mBoots);
    legR.position.set(0.14, 0.22, 0);
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.6, 0.34), mTunic);
    torso.position.set(0, 0.74, 0);
    const cape = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.56, 0.08), mCape);
    cape.position.set(0, 0.74, -0.22);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.44, 0.44), mSkin);
    head.position.set(0, 1.26, 0);
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.06), mDark);
    eyeL.position.set(-0.1, 1.28, 0.21);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.06), mDark);
    eyeR.position.set(0.1, 1.28, 0.21);
    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.6), mHat);
    brim.position.set(0, 1.50, 0);
    const crown = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.42), mHat);
    crown.position.set(0, 1.62, 0);

    const armL = new THREE.Group();
    armL.position.set(-0.37, 0.90, 0);
    const aLm = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.34, 0.17), mSleeve);
    aLm.position.y = -0.14;
    const hLm = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.14, 0.15), mSkin);
    hLm.position.y = -0.36;
    armL.add(aLm, hLm);

    const armR = new THREE.Group();
    armR.position.set(0.37, 0.90, 0);
    const aRm = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.34, 0.17), mSleeve);
    aRm.position.y = -0.14;
    const hRm = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.14, 0.15), mSkin);
    hRm.position.y = -0.36;
    const heldWpn = buildWeaponMesh(ap.weapon, ap.weaponLvl || 2);
    heldWpn.position.set(0, -0.38, 0.18);
    armR.add(aRm, hRm, heldWpn);

    const lbl = makeFloatingLabel(`[${ap.tag}] ${ap.name}`, '#67e8f9', 288, 3.8);
    lbl.position.set(0, 2.25, 0);

    g.add(legL, legR, torso, cape, head, eyeL, eyeR, brim, crown, armL, armR, lbl);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    root.add(g);

    const firstWp = havenWaypoints[Math.floor(Math.random() * havenWaypoints.length)];
    roamingAi.push({
      group: g, legL, legR, armL, armR, cape,
      pos: new THREE.Vector3(ap.spawnX, 0.008, ap.spawnZ),
      targetX: firstWp[0], targetZ: firstWp[1],
      yaw: 0, speed: 3.4 + Math.random() * 1.4,
      waitTimer: 0.4 + Math.random() * 1.5,
      jumpY: 0, jumpVel: 0, walkCycle: Math.random() * 5,
      swingTimer: 0,
    });
  }

  // Moving Platforms
  for (const m of levelDef.movers || []) {
    const { mesh, col } = addBlock(m.x1, m.y1 - 0.35, m.z1, m.w, 0.7, m.d, mats.movingPlatform);
    const plat = {
      mesh, col,
      start: new THREE.Vector3(m.x1, m.y1 - 0.35, m.z1),
      end: new THREE.Vector3(m.x2, m.y2 - 0.35, m.z2),
      w: m.w, h: 0.7, d: m.d, speed: m.speed || 0.8, phase: 0,
      prevPos: new THREE.Vector3(m.x1, m.y1 - 0.35, m.z1),
      delta: new THREE.Vector3(),
    };
    col.moving = plat;
    movingPlatforms.push(plat);
  }

  // 1. Crumbling Stone Bridges (shake when stepped on, drop, then respawn!)
  for (const c of levelDef.crumbleBlocks || []) {
    const crMat = new THREE.MeshLambertMaterial({ color: 0xb45309, emissive: 0x000000, emissiveIntensity: 0 });
    const { mesh, col } = addBlock(c.x, c.y - 0.35, c.z, c.w, 0.7, c.d, crMat);
    const cb = {
      mesh, col, mat: crMat,
      baseX: c.x, baseY: c.y - 0.35, baseZ: c.z,
      state: 'ready', timer: 0,
    };
    col.crumble = cb;
    crumbleBlocks.push(cb);
  }

  // 2. Pop-Up Floor Spike Traps (cleanly elevated above ground with polygonOffset — zero Z-fighting!)
  const spikeGeo = new THREE.ConeGeometry(0.22, 0.92, 4);
  for (const s of levelDef.spikeTraps || []) {
    const g = new THREE.Group();
    g.position.set(s.x, s.y, s.z);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x334155, emissive: 0x000000, emissiveIntensity: 0, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    const basePlate = new THREE.Mesh(new THREE.BoxGeometry(s.w, 0.14, s.d), baseMat);
    basePlate.position.y = 0.08;
    g.add(basePlate);

    const spikesGroup = new THREE.Group();
    const spMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0, emissive: 0xe11d48, emissiveIntensity: 0.35 });
    for (const ox of [-0.6, 0.6]) {
      for (const oz of [-0.6, 0.6]) {
        const sp = new THREE.Mesh(spikeGeo, spMat);
        sp.position.set(ox, 0.45, oz);
        spikesGroup.add(sp);
      }
    }
    spikesGroup.position.y = -0.92;
    spikesGroup.visible = false;
    g.add(spikesGroup);
    root.add(g);
    spikeTraps.push({
      x: s.x, y: s.y, z: s.z, w: s.w, d: s.d,
      period: s.period || 2.8, phase: s.phase || 0,
      baseMat, spikesGroup, active: false,
    });
  }

  // 3. Spinning Blade Sweeper Totems (jump or dash over the rotating bar!)
  for (const sp of levelDef.spinners || []) {
    const g = new THREE.Group();
    g.position.set(sp.x, sp.y, sp.z);
    const hub = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.35, 0.95), mats.runeStone);
    hub.position.y = 0.68;
    const cap = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.36, 0),
      new THREE.MeshBasicMaterial({ color: 0xf43f5e })
    );
    cap.position.y = 1.62;

    const arm = new THREE.Group();
    arm.position.y = 0.56;
    const bladeMat = new THREE.MeshLambertMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.85 });
    const bar = new THREE.Mesh(new THREE.BoxGeometry(sp.radius * 2, 0.24, 0.34), bladeMat);
    const tipL = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 0.48), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    tipL.position.x = -sp.radius;
    const tipR = tipL.clone();
    tipR.position.x = sp.radius;
    arm.add(bar, tipL, tipR);

    g.add(hub, cap, arm);
    root.add(g);
    addCollider(sp.x, sp.y + 0.68, sp.z, 0.95, 1.35, 0.95);
    spinners.push({
      x: sp.x, y: sp.y, z: sp.z,
      radius: sp.radius, speed: sp.speed, phase: sp.phase || 0,
      arm, angle: sp.phase || 0,
    });
  }

  // 4. Sliding Crusher / Pusher Hazard Blocks
  for (const cr of levelDef.crushers || []) {
    const g = new THREE.Group();
    g.position.set(cr.x1, cr.y1 + cr.h / 2, cr.z1);
    const body = new THREE.Mesh(new THREE.BoxGeometry(cr.w, cr.h, cr.d), mats.obsidian);
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(cr.w + 0.08, 0.32, cr.d + 0.08),
      new THREE.MeshLambertMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 0.75 })
    );
    g.add(body, stripe);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    root.add(g);
    crushers.push({
      group: g,
      start: new THREE.Vector3(cr.x1, cr.y1 + cr.h / 2, cr.z1),
      end: new THREE.Vector3(cr.x2, cr.y2 + cr.h / 2, cr.z2),
      w: cr.w, h: cr.h, d: cr.d,
      speed: cr.speed || 1.4, phase: cr.phase || 0,
      pos: new THREE.Vector3(cr.x1, cr.y1 + cr.h / 2, cr.z1),
      velX: 0,
    });
  }

  // 5. Biome Hazard Zones (clean polygonOffset slab — zero ground Z-fighting!)
  for (const hz of levelDef.hazardZones || []) {
    const mat = new THREE.MeshLambertMaterial({
      color: hz.color || 0xef4444,
      emissive: hz.emissive || 0x991b1b,
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0.9,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const slab = new THREE.Mesh(new THREE.BoxGeometry(hz.w, 0.08, hz.d), mat);
    slab.position.set(hz.x, hz.y + 0.05, hz.z);
    root.add(slab);
    hazardZones.push({ x: hz.x, y: hz.y, z: hz.z, w: hz.w, d: hz.d, mat });
  }

  // 6. Swinging Pendulum Axes hanging from Stone Archways!
  for (const pd of levelDef.pendulums || []) {
    const g = new THREE.Group();
    g.position.set(pd.x, pd.y, pd.z);
    // Arch frame pillars + crossbar
    addBlock(pd.x - 4.4, pd.y + pd.height / 2, pd.z, 0.9, pd.height, 0.9, mats.runeStone);
    addBlock(pd.x + 4.4, pd.y + pd.height / 2, pd.z, 0.9, pd.height, 0.9, mats.runeStone);
    addBlock(pd.x, pd.y + pd.height, pd.z, 9.7, 0.8, 0.95, mats.runeStone, { solid: false });

    const pivot = new THREE.Group();
    pivot.position.set(0, pd.height - 0.2, 0);
    const rod = new THREE.Mesh(new THREE.BoxGeometry(0.22, pd.armLen, 0.22), new THREE.MeshLambertMaterial({ color: 0x64748b }));
    rod.position.y = -pd.armLen / 2;
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 1.1, 0.34),
      new THREE.MeshLambertMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.72 })
    );
    head.position.y = -pd.armLen;
    const edge = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.28, 0.4), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    edge.position.y = -pd.armLen - 0.36;
    pivot.add(rod, head, edge);
    g.add(pivot);
    root.add(g);

    pendulums.push({
      x: pd.x, y: pd.y, z: pd.z,
      height: pd.height, armLen: pd.armLen, maxAngle: pd.maxAngle || 0.95,
      speed: pd.speed || 1.9, phase: pd.phase || 0,
      pivot, headPos: new THREE.Vector3(pd.x, pd.y + pd.height - pd.armLen, pd.z),
    });
  }

  // 7. Rune Energy Turret Pylons firing periodic energy orbs!
  const orbGeo = new THREE.OctahedronGeometry(0.36, 0);
  for (const tr of levelDef.turrets || []) {
    addBlock(tr.x, tr.y + 1.05, tr.z, 1.05, 2.1, 1.05, mats.runeStone);
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.46, 0),
      new THREE.MeshBasicMaterial({ color: tr.color || 0xf43f5e })
    );
    crystal.position.set(tr.x, tr.y + 2.4, tr.z);
    root.add(crystal);
    torches.push(crystal);

    turrets.push({
      x: tr.x, y: tr.y + 1.15, z: tr.z,
      dirX: tr.dirX, dirZ: tr.dirZ,
      interval: tr.interval || 2.5,
      speed: tr.speed || 11,
      range: tr.range || 16,
      timer: (tr.phase || 0) % (tr.interval || 2.5),
      color: tr.color || 0xf43f5e,
    });
  }

  // Safe Haven 5 Graphic-Artist Sculpted Textured Portals (Sky Forest, Sky Beach, Duel Arena, Sky Desert, Sky Dungeon!)
  for (const pt of levelDef.portals || []) {
    const gate = buildDetailedPortal(root, pt, addCollider, animHooks, mats, waterMat);
    const label = makeFloatingLabel(pt.unlocked ? pt.label : `LOCKED: ${pt.label}`, pt.unlocked ? '#' + pt.color.toString(16).padStart(6, '0') : '#f87171', 288, 4.6);
    label.position.set(pt.x, pt.y + 6.9, pt.z);
    root.add(label);

    portals.push({ ...pt, gate, pos: new THREE.Vector3(pt.x, pt.y + 1.1, pt.z) });
  }

  // Safe Haven Grand Skybound Weapon & Gear Store Building + Save Crystal Shrine
  let shopPos = null;
  if (levelDef.shopStall) {
    const s = levelDef.shopStall;
    buildWeaponStoreBuilding(root, addCollider, animHooks, s.x, s.y, s.z, mats);
    const lbl = makeFloatingLabel('WEAPON & GEAR STORE', '#facc15', 320, 4.8);
    lbl.position.set(s.x, s.y + 6.4, s.z);
    root.add(lbl);
    shopPos = new THREE.Vector3(s.x, s.y + 1.0, s.z + 3.8);
  }

  let savePos = null;
  let saveCrystalMesh = null;
  if (levelDef.saveShrine) {
    const sv = levelDef.saveShrine;
    addBlock(sv.x, sv.y + 0.5, sv.z, 1.8, 1.0, 1.8, mats.ruinBrick);
    saveCrystalMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.65, 0),
      new THREE.MeshLambertMaterial({ color: 0x34d399, emissive: 0x10b981, emissiveIntensity: 0.85 })
    );
    saveCrystalMesh.position.set(sv.x, sv.y + 2.0, sv.z);
    root.add(saveCrystalMesh);
    const lbl = makeFloatingLabel('SAVE & HEAL', '#34d399');
    lbl.position.set(sv.x, sv.y + 3.4, sv.z);
    root.add(lbl);
    savePos = new THREE.Vector3(sv.x, sv.y + 1.0, sv.z);
  }
  if (levelDef.dummy) {
    addCollider(levelDef.dummy.x, levelDef.dummy.y + 0.85, levelDef.dummy.z, 0.8, 1.7, 0.8);
  }

  // Hidden Treasure Chests (Every 25th Level)
  for (const ch of levelDef.chests || []) {
    const alreadyOpen = !!openedChests[ch.id];
    const g = new THREE.Group();
    g.position.set(ch.x, ch.y, ch.z);
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.74, 0.98), mats.chest);
    base.position.y = 0.37;
    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.34, 1.0), mats.chest);
    lid.position.set(0, 0.88, 0);
    if (alreadyOpen) lid.rotation.x = -1.15;
    const glow = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.35, 0),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: alreadyOpen ? 0 : 0.85 })
    );
    glow.position.y = 1.5;
    g.add(base, lid, glow);
    root.add(g);
    addCollider(ch.x, ch.y + 0.45, ch.z, 1.35, 0.9, 0.98);
    chests.push({ ...ch, group: g, lid, glow, opened: alreadyOpen, pos: new THREE.Vector3(ch.x, ch.y + 0.6, ch.z) });
  }

  // Goal Relic (Starts Sealed with a Red Barrier until Island Guardians are defeated!)
  let goalRelic = null;
  if (levelDef.relic) {
    const r = levelDef.relic;
    const g = new THREE.Group();
    g.position.set(r.x, r.y, r.z);
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.68, 0), new THREE.MeshLambertMaterial({ color: 0xfacc15, emissive: 0xf59e0b, emissiveIntensity: 0.78 }));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.09, 6, 14), new THREE.MeshLambertMaterial({ color: 0xfff3b0, emissive: 0xf59e0b, emissiveIntensity: 0.55 }));
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.52, 9.5, 6, 1, true), new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false }));
    beam.position.y = 4.4;

    const sealDome = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.42, 1),
      new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true, transparent: true, opacity: 0.75 })
    );
    sealDome.visible = !!r.sealed;

    const sealLabel = makeFloatingLabel('SEALED: DEFEAT GUARDIANS', '#fb7185', 384, 5.2);
    sealLabel.position.set(0, 2.25, 0);
    sealLabel.visible = !!r.sealed;

    g.add(core, ring, beam, sealDome, sealLabel);
    root.add(g);
    goalRelic = {
      group: g, core, ring, beam, sealDome, sealLabel,
      baseY: r.y, pos: new THREE.Vector3(r.x, r.y, r.z),
      title: r.title, collected: false, sealed: !!r.sealed,
    };
  }

  function setRelicUnlocked(unlocked) {
    if (!goalRelic || goalRelic.collected) return;
    if (unlocked && goalRelic.sealed) {
      goalRelic.sealed = false;
      goalRelic.sealDome.visible = false;
      goalRelic.sealLabel.visible = false;
      spawnBurst(goalRelic.pos.clone(), 0xfacc15, 24, 6.2);
    }
  }

  // Multi-Layered Voxel Clouds (High Sky Clouds + Low Floating Cloud Sea!)
  for (let i = 0; i < 18; i++) {
    const g = new THREE.Group();
    const isLow = i >= 10;
    const s = isLow ? (8 + (i % 3) * 3) : (5.5 + (i % 3) * 2.0);
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(s, 1.2, s * 0.65), mats.cloud);
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(s * 0.65, 1.1, s * 0.52), mats.cloud);
    b2.position.set(s * 0.22, 0.7, 0.2);
    g.add(b1, b2);
    const cx = -55 + (i * 13) % 110;
    const cy = isLow ? (-9 - (i % 4) * 2.5) : (12 + (i % 4) * 4.5);
    const cz = -i * 11 + 26;
    g.position.set(cx, cy, cz);
    root.add(g);
    clouds.push({ group: g, speed: isLow ? 0.55 : (0.35 + (i % 3) * 0.18) });
  }

  // Floating Biome Dust Motes & Wind Particles!
  const dustMat = new THREE.MeshBasicMaterial({
    color: levelDef.dustColor || 0xfef08a,
    transparent: true,
    opacity: 0.65,
  });
  for (let i = 0; i < 52; i++) {
    const m = new THREE.Mesh(unitBox, dustMat);
    const sz = 0.09 + (i % 3) * 0.04;
    m.scale.set(sz * 1.8, sz, sz);
    const px = (Math.random() - 0.5) * 65;
    const py = 0.8 + Math.random() * 14;
    const pz = 20 - Math.random() * 110;
    m.position.set(px, py, pz);
    root.add(m);
    dustMotes.push({
      mesh: m,
      windX: 1.4 + Math.random() * 2.2,
      bobPhase: Math.random() * Math.PI * 2,
      baseY: py,
    });
  }

  function spawnBurst(pos, color = 0x67e8f9, count = 12, speed = 4.5) {
    for (let i = 0; i < count; i++) {
      const m = new THREE.Mesh(unitBox, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 }));
      m.scale.setScalar(0.18 + Math.random() * 0.14);
      m.position.copy(pos);
      root.add(m);
      const ang = Math.random() * Math.PI * 2;
      const spd = (0.4 + Math.random() * 0.8) * speed;
      sparkles.push({
        mesh: m,
        vel: new THREE.Vector3(Math.cos(ang) * spd, 1.6 + Math.random() * speed * 0.7, Math.sin(ang) * spd),
        life: 0.45 + Math.random() * 0.25,
        maxLife: 0.7,
      });
    }
  }

  function update(dt, elapsed, playerPos = null) {
    waterMat.uniforms.uTime.value = elapsed;
    for (const hook of animHooks) hook(dt, elapsed, playerPos);
    for (const p of movingPlatforms) {
      p.prevPos.copy(p.mesh.position);
      const alpha = (Math.sin(elapsed * p.speed + p.phase) + 1) * 0.5;
      p.mesh.position.lerpVectors(p.start, p.end, alpha);
      p.delta.subVectors(p.mesh.position, p.prevPos);
      p.col.minX = p.mesh.position.x - p.w / 2; p.col.maxX = p.mesh.position.x + p.w / 2;
      p.col.minY = p.mesh.position.y - p.h / 2; p.col.maxY = p.mesh.position.y + p.h / 2;
      p.col.minZ = p.mesh.position.z - p.d / 2; p.col.maxZ = p.mesh.position.z + p.d / 2;
    }

    // Update Crumbling Bridges
    for (const cb of crumbleBlocks) {
      if (cb.state === 'shaking') {
        cb.timer -= dt;
        cb.mesh.position.x = cb.baseX + (Math.random() - 0.5) * 0.22;
        cb.mesh.position.z = cb.baseZ + (Math.random() - 0.5) * 0.22;
        cb.mat.emissive.setHex(0xea580c);
        cb.mat.emissiveIntensity = 0.75;
        if (cb.timer <= 0) {
          cb.state = 'fallen';
          cb.timer = 3.0;
          cb.mesh.visible = false;
          cb.col.disabled = true;
          spawnBurst(new THREE.Vector3(cb.baseX, cb.baseY + 0.3, cb.baseZ), 0xd97706, 10, 4.0);
        }
      } else if (cb.state === 'fallen') {
        cb.timer -= dt;
        if (cb.timer <= 0) {
          cb.state = 'ready';
          cb.mesh.visible = true;
          cb.mesh.position.set(cb.baseX, cb.baseY, cb.baseZ);
          cb.col.disabled = false;
          cb.mat.emissive.setHex(0x000000);
          cb.mat.emissiveIntensity = 0;
        }
      }
    }

    // Update Pop-Up Spike Traps
    for (const st of spikeTraps) {
      const cycle = ((elapsed + st.phase) % st.period) / st.period;
      if (cycle < 0.48) {
        st.active = false;
        st.spikesGroup.visible = false;
        st.spikesGroup.position.y = -0.92;
        st.baseMat.emissive.setHex(0x000000);
        st.baseMat.emissiveIntensity = 0;
      } else if (cycle < 0.64) {
        st.active = false;
        st.spikesGroup.visible = true;
        st.spikesGroup.position.y = -0.52;
        st.baseMat.emissive.setHex(0xf59e0b);
        st.baseMat.emissiveIntensity = 0.85;
      } else {
        st.active = true;
        st.spikesGroup.visible = true;
        st.spikesGroup.position.y = 0.04;
        st.baseMat.emissive.setHex(0xe11d48);
        st.baseMat.emissiveIntensity = 0.9;
      }
    }

    // Update Spinning Blade Sweepers
    for (const sp of spinners) {
      sp.angle = elapsed * sp.speed + sp.phase;
      sp.arm.rotation.y = sp.angle;
    }

    // Update Sliding Crusher Blocks
    for (const cr of crushers) {
      const prevX = cr.pos.x;
      const alpha = (Math.sin(elapsed * cr.speed + cr.phase) + 1) * 0.5;
      cr.pos.lerpVectors(cr.start, cr.end, alpha);
      cr.group.position.copy(cr.pos);
      cr.velX = dt > 0.0001 ? (cr.pos.x - prevX) / dt : 0;
    }

    // Pulse Biome Hazard Zones
    for (const hz of hazardZones) {
      hz.mat.emissiveIntensity = 0.65 + Math.sin(elapsed * 4.5 + hz.x) * 0.35;
    }

    // Update Swinging Pendulum Axes
    for (const pd of pendulums) {
      const ang = Math.sin(elapsed * pd.speed + pd.phase) * pd.maxAngle;
      pd.pivot.rotation.z = ang;
      pd.headPos.set(
        pd.x + Math.sin(ang) * pd.armLen,
        pd.y + (pd.height - 0.2) - Math.cos(ang) * pd.armLen,
        pd.z
      );
    }

    // Update Rune Energy Turrets & Active Orbs
    for (const tr of turrets) {
      tr.timer -= dt;
      if (tr.timer <= 0) {
        tr.timer = tr.interval;
        const orbMesh = new THREE.Mesh(
          orbGeo,
          new THREE.MeshBasicMaterial({ color: tr.color })
        );
        orbMesh.position.set(tr.x + tr.dirX * 0.8, tr.y, tr.z + tr.dirZ * 0.8);
        root.add(orbMesh);
        turretOrbs.push({
          mesh: orbMesh,
          pos: orbMesh.position.clone(),
          vx: tr.dirX * tr.speed,
          vz: tr.dirZ * tr.speed,
          life: tr.range / tr.speed,
        });
      }
    }
    for (let i = turretOrbs.length - 1; i >= 0; i--) {
      const o = turretOrbs[i];
      o.life -= dt;
      o.pos.x += o.vx * dt;
      o.pos.z += o.vz * dt;
      o.mesh.position.copy(o.pos);
      o.mesh.rotation.y += 6 * dt;
      if (o.life <= 0) {
        root.remove(o.mesh);
        o.mesh.material.dispose();
        turretOrbs.splice(i, 1);
      }
    }

    // Wind Sway on Trees & Palm Crowns!
    for (const f of swayFoliage) {
      f.group.rotation.z = Math.sin(elapsed * 1.9 + f.phase) * f.amp;
      f.group.rotation.x = Math.cos(elapsed * 1.4 + f.phase) * (f.amp * 0.65);
    }

    // Drifting Wind & Sunlit Dust Motes
    for (const d of dustMotes) {
      d.mesh.position.x += d.windX * dt;
      d.mesh.position.y = d.baseY + Math.sin(elapsed * 1.8 + d.bobPhase) * 0.6;
      if (d.mesh.position.x > 42) d.mesh.position.x = -42;
    }

    // Friendly Safe Haven NPCs idle bobbing
    for (const n of friendlyNpcs) {
      n.marker.position.y = 3.05 + Math.sin(elapsed * 3.0 + n.x) * 0.16;
    }

    // Roaming Safe Haven AI NPC Explorers (Autonomous Waypoint, Avoidance, Jump & Emote AI!)
    for (const ai of roamingAi) {
      // Gravity for playful hops
      if (ai.jumpY > 0 || ai.jumpVel > 0) {
        ai.jumpVel -= 22 * dt;
        ai.jumpY = Math.max(0, ai.jumpY + ai.jumpVel * dt);
        if (ai.jumpY <= 0) ai.jumpVel = 0;
      }

      if (ai.waitTimer > 0) {
        ai.waitTimer -= dt;
        ai.legL.rotation.x *= 0.82;
        ai.legR.rotation.x *= 0.82;
        if (ai.swingTimer > 0) {
          ai.swingTimer -= dt;
          ai.armR.rotation.x = -1.65;
        } else {
          ai.armR.rotation.x *= 0.85;
        }
        ai.armL.rotation.x *= 0.85;
        if (ai.waitTimer <= 0) {
          const wp = havenWaypoints[Math.floor(Math.random() * havenWaypoints.length)];
          ai.targetX = wp[0] + (Math.random() - 0.5) * 4.5;
          ai.targetZ = wp[1] + (Math.random() - 0.5) * 4.5;
          if (Math.random() < 0.35 && ai.jumpY <= 0) ai.jumpVel = 7.4;
        }
      } else {
        let dx = ai.targetX - ai.pos.x;
        let dz = ai.targetZ - ai.pos.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 1.1) {
          ai.waitTimer = 1.4 + Math.random() * 2.6;
          if (Math.random() < 0.45) ai.swingTimer = 0.42;
        } else {
          // Steer cleanly around Grand Sanctuary Fountain (0, 6), Blacksmith Forge (-27.5, 6), & Weapon Store (27.5, 6)
          for (const [ox, oz, rad] of [[0, 6, 5.6], [-27.5, 6, 6.2], [27.5, 6, 6.2]]) {
            const oDist = Math.hypot(ai.pos.x - ox, ai.pos.z - oz);
            if (oDist < rad && oDist > 0.05) {
              dx += ((ai.pos.x - ox) / oDist) * 5.6;
              dz += ((ai.pos.z - oz) / oDist) * 5.6;
            }
          }
          const len = Math.hypot(dx, dz) || 1;
          const desiredYaw = Math.atan2(dx, dz);
          let diff = desiredYaw - ai.yaw;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          ai.yaw += diff * Math.min(1, 8 * dt);
          ai.pos.x = Math.max(-56, Math.min(56, ai.pos.x + (dx / len) * ai.speed * dt));
          ai.pos.z = Math.max(-52, Math.min(52, ai.pos.z + (dz / len) * ai.speed * dt));
          ai.walkCycle += dt * ai.speed * 1.9;
          const sw = Math.sin(ai.walkCycle) * 0.55;
          ai.legL.rotation.x = sw;
          ai.legR.rotation.x = -sw;
          ai.armL.rotation.x = -sw * 0.7;
          ai.armR.rotation.x = sw * 0.6;
          ai.cape.rotation.x = 0.22 + Math.abs(sw) * 0.25;
        }
      }
      ai.group.position.set(ai.pos.x, ai.pos.y + ai.jumpY, ai.pos.z);
      ai.group.rotation.y = ai.yaw;
    }

    if (goalRelic && !goalRelic.collected) {
      goalRelic.group.position.y = goalRelic.baseY + Math.sin(elapsed * 2.4) * 0.25;
      goalRelic.core.rotation.y = elapsed * 1.9;
      goalRelic.ring.rotation.x = Math.PI / 2 + Math.sin(elapsed * 1.4) * 0.45;
      goalRelic.ring.rotation.z = elapsed * 1.4;
      if (goalRelic.sealed && goalRelic.sealDome) {
        goalRelic.sealDome.rotation.y = -elapsed * 1.1;
        goalRelic.sealDome.rotation.x = elapsed * 0.6;
      }
    }

    if (saveCrystalMesh) {
      saveCrystalMesh.rotation.y = elapsed * 1.8;
      saveCrystalMesh.position.y = 2.0 + Math.sin(elapsed * 2.2) * 0.14;
    }

    for (const ch of chests) {
      if (!ch.opened) {
        ch.glow.rotation.y = elapsed * 2.8;
        ch.glow.position.y = 1.5 + Math.sin(elapsed * 3.0) * 0.14;
      }
    }

    for (const pt of portals) {
      pt.gate.material.opacity = pt.unlocked ? (0.48 + Math.sin(elapsed * 3.2) * 0.14) : 0.22;
    }

    for (const fl of torches) {
      fl.rotation.y = elapsed * 4.0;
      fl.scale.setScalar(0.9 + Math.sin(elapsed * 9 + fl.position.x) * 0.15);
    }

    for (const cp of checkpoints) cp.orb.rotation.y = elapsed * (cp.active ? 2.5 : 0.8);

    for (const c of clouds) {
      c.group.position.x += c.speed * dt;
      if (c.group.position.x > 60) c.group.position.x = -60;
    }

    if (wpGroup.visible) {
      wpDiamond.rotation.y = elapsed * 2.8;
      wpDiamond.position.y = 5.4 + Math.sin(elapsed * 3.8) * 0.45;
      wpBeam.material.opacity = 0.24 + Math.sin(elapsed * 4.0) * 0.10;
    }

    if (guideArrow.visible) {
      guideArrowInner.position.y = Math.sin(elapsed * 5.2) * 0.11;
    }

    // Animate Expanding Water Splash Ripple Rings!
    for (let i = waterRipples.length - 1; i >= 0; i--) {
      const rp = waterRipples[i];
      rp.life -= dt;
      if (rp.life <= 0) {
        root.remove(rp.mesh);
        rp.mesh.geometry.dispose();
        rp.mesh.material.dispose();
        waterRipples.splice(i, 1);
        continue;
      }
      const prog = 1 - rp.life / rp.maxLife;
      rp.mesh.scale.setScalar(1 + prog * rp.maxScale);
      rp.mesh.material.opacity = Math.max(0, (1 - prog) * 0.88);
    }

    for (let i = sparkles.length - 1; i >= 0; i--) {
      const sp = sparkles[i];
      sp.life -= dt;
      if (sp.life <= 0) {
        root.remove(sp.mesh);
        sp.mesh.material.dispose();
        sparkles.splice(i, 1);
        continue;
      }
      sp.vel.y -= 10 * dt;
      sp.mesh.position.addScaledVector(sp.vel, dt);
      sp.mesh.material.opacity = Math.max(0, sp.life / sp.maxLife);
    }
  }

  // Interactive 3D Water Splash VFX + Expanding Surface Ripples + Splash SFX!
  function spawnWaterSplash(pos, power = 1.0) {
    const now = performance.now();
    if (now - lastSplashSfx > 110) {
      lastSplashSfx = now;
      audio.playWaterSplash();
    }
    const dropCount = Math.round(12 * power);
    for (let i = 0; i < dropCount; i++) {
      const m = new THREE.Mesh(
        unitBox,
        new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0xe0faff : (i % 2 === 0 ? 0x38bdf8 : 0x7dd3fc), transparent: true, opacity: 0.95 })
      );
      const sz = (0.11 + Math.random() * 0.13) * Math.min(1.4, power);
      m.scale.setScalar(sz);
      m.position.set(pos.x + (Math.random() - 0.5) * 0.35, pos.y + 0.08, pos.z + (Math.random() - 0.5) * 0.35);
      root.add(m);
      const ang = Math.random() * Math.PI * 2;
      const spd = (1.6 + Math.random() * 2.8) * Math.min(1.4, power);
      sparkles.push({
        mesh: m,
        vel: new THREE.Vector3(Math.cos(ang) * spd, (3.8 + Math.random() * 3.4) * Math.min(1.35, power), Math.sin(ang) * spd),
        life: 0.55 + Math.random() * 0.25,
        maxLife: 0.80,
      });
    }
    // 2 expanding concentric foam ripple rings across the water surface!
    for (let r = 0; r < 2; r++) {
      const rGeo = new THREE.RingGeometry(0.18 + r * 0.14, 0.34 + r * 0.16, 18);
      rGeo.rotateX(-Math.PI / 2);
      const rMat = new THREE.MeshBasicMaterial({
        color: r === 0 ? 0xffffff : 0x7dd3fc,
        side: THREE.DoubleSide, transparent: true, opacity: 0.88, depthWrite: false,
        polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -5,
      });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.position.set(pos.x, pos.y + 0.05 + r * 0.015, pos.z);
      root.add(rMesh);
      waterRipples.push({
        mesh: rMesh,
        life: 0.55 + r * 0.22,
        maxLife: 0.55 + r * 0.22,
        maxScale: (3.2 + r * 1.8) * Math.min(1.35, power),
      });
    }
  }

  // Towering 3D Tracked Quest Waypoint Beacon (22m sky beam + bouncing golden downward chevron!)
  const wpGroup = new THREE.Group();
  const wpDiamond = new THREE.Group();
  const wpHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.68, 1.15, 4),
    new THREE.MeshBasicMaterial({ color: 0xfacc15 })
  );
  wpHead.rotation.x = Math.PI; // points straight down at target!
  const wpStem = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.85, 0.36),
    new THREE.MeshBasicMaterial({ color: 0xfef08a })
  );
  wpStem.position.y = 0.88;
  wpDiamond.add(wpHead, wpStem);
  wpDiamond.position.y = 5.4;
  const wpBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.48, 22, 8, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false })
  );
  wpBeam.position.y = 11.0;
  wpGroup.add(wpDiamond, wpBeam);
  wpGroup.visible = false;
  root.add(wpGroup);

  // 3D Floating Overhead Quest Direction Arrow above the Hero (ALWAYS points straight toward tracked quest!)
  const guideArrow = new THREE.Group();
  const guideArrowInner = new THREE.Group();
  const gaShaft = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.14, 0.68),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  gaShaft.position.z = -0.18;
  const gaTip = new THREE.Mesh(
    new THREE.ConeGeometry(0.34, 0.62, 4),
    new THREE.MeshBasicMaterial({ color: 0xfacc15 })
  );
  gaTip.rotation.x = Math.PI / 2; // points along +Z
  gaTip.rotation.y = Math.PI / 4;
  gaTip.position.z = 0.42;
  const gaOutline = new THREE.Mesh(
    new THREE.RingGeometry(0.42, 0.50, 16),
    new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.55, depthWrite: false })
  );
  gaOutline.rotation.x = -Math.PI / 2;
  gaOutline.position.y = -0.12;
  guideArrowInner.add(gaShaft, gaTip, gaOutline);
  guideArrow.add(guideArrowInner);
  guideArrow.visible = false;
  root.add(guideArrow);

  function setWaypoint(x, y, z, visible = true) {
    wpGroup.visible = !!visible;
    if (visible) wpGroup.position.set(x, y, z);
  }

  function setGuideArrow(playerPos, targetPos, visible = true) {
    if (!visible || !playerPos || !targetPos) {
      guideArrow.visible = false;
      return;
    }
    const dx = targetPos.x - playerPos.x;
    const dz = targetPos.z - playerPos.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 2.2) {
      guideArrow.visible = false;
      return;
    }
    guideArrow.visible = true;
    guideArrow.position.set(playerPos.x, playerPos.y + 2.48, playerPos.z);
    guideArrow.rotation.y = Math.atan2(dx, dz);
  }

  function dispose() {
    const sharedSet = new Set();
    for (const v of Object.values(mats)) {
      if (Array.isArray(v)) v.forEach((m) => sharedSet.add(m));
      else sharedSet.add(v);
    }
    scene.remove(root);
    root.traverse((obj) => {
      if (obj.geometry && obj.geometry !== unitBox) obj.geometry.dispose();
      if (obj.material) {
        const list = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const m of list) {
          if (!sharedSet.has(m)) {
            if (m.map && m.map.isCanvasTexture && !m.map.userData?.shared) m.map.dispose();
            m.dispose();
          }
        }
      }
    });
    resetHdAssetCache();
    unitBox.dispose();
  }

  return {
    colliders, movingPlatforms, spikeTraps, spinners, crumbleBlocks, crushers, hazardZones,
    pendulums, turrets, turretOrbs, waterZones,
    portals, chests, checkpoints, friendlyNpcs,
    goalRelic, shopPos, savePos, castleInteriorBounds,
    setRelicUnlocked, setWaypoint, setGuideArrow, spawnBurst, spawnWaterSplash, update, dispose,
  };
}
