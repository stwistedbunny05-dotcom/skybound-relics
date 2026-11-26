import * as THREE from '../lib/three.module.min.js';
import { audio } from './audio.js';
import { WEAPON_CATALOG, getGlowTier, getEquippedItem, getEquippedArrow, getItemDamage, getGuildDifficulty } from './state.js';
import { makeCharacterTextures } from './textures.js';

// Shared Graphic-Artist HD Voxel Weapon Builder (all 13 fantasy weapons + layered bevels, gems, fuller & upgrade glow!)
export function buildWeaponMesh(weaponId, upgradeLevel = 1) {
  const g = new THREE.Group();
  const def = WEAPON_CATALOG[weaponId] || WEAPON_CATALOG.stone;
  const model = def.model || weaponId;
  const glow = getGlowTier(upgradeLevel);

  const mBlade = new THREE.MeshLambertMaterial({
    color: upgradeLevel > 1 ? glow.color : (def.tint || 0xe2e8f0),
    emissive: glow.emissive,
    emissiveIntensity: glow.intensity,
  });
  const mEdge = new THREE.MeshLambertMaterial({
    color: upgradeLevel > 1 ? 0xffffff : 0xf8fafc,
    emissive: glow.emissive,
    emissiveIntensity: Math.max(0.25, glow.intensity * 1.1),
  });
  const mHandle = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
  const mWrap = new THREE.MeshLambertMaterial({ color: 0x3b2314 });
  const mGuard = new THREE.MeshLambertMaterial({
    color: 0xfacc15,
    emissive: glow.emissive,
    emissiveIntensity: glow.intensity * 0.45,
  });
  const mGem = new THREE.MeshLambertMaterial({
    color: upgradeLevel > 1 ? glow.color : 0x38bdf8,
    emissive: upgradeLevel > 1 ? glow.emissive : 0x0284c7,
    emissiveIntensity: Math.max(0.5, glow.intensity),
  });
  const addBox = (x, y, z, w, h, d, mat, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    if (rx) m.rotation.x = rx;
    if (ry) m.rotation.y = ry;
    if (rz) m.rotation.z = rz;
    g.add(m);
    return m;
  };

  if (model === 'stone') {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.19, 0),
      new THREE.MeshLambertMaterial({
        color: upgradeLevel > 1 ? glow.color : 0x94a3b8,
        emissive: glow.emissive,
        emissiveIntensity: glow.intensity * 0.85,
      })
    );
    g.add(rock);
    addBox(0, 0.08, 0.06, 0.14, 0.06, 0.24, mGem);
    addBox(0.08, -0.05, -0.04, 0.10, 0.14, 0.10, mGuard);
  } else if (model === 'knife') {
    addBox(0, 0, -0.02, 0.09, 0.09, 0.22, mHandle);
    addBox(0, 0, -0.14, 0.11, 0.11, 0.06, mGuard);
    addBox(0, 0, 0.11, 0.16, 0.12, 0.06, mGuard);
    addBox(0, 0.01, 0.30, 0.06, 0.12, 0.34, mBlade);
    addBox(0, 0.03, 0.49, 0.04, 0.08, 0.12, mEdge);
  } else if (model === 'dagger') {
    addBox(0, 0, -0.04, 0.08, 0.08, 0.22, mWrap);
    addBox(0, 0, -0.17, 0.12, 0.12, 0.07, mGuard);
    addBox(0, 0, 0.12, 0.28, 0.09, 0.07, mGuard);
    addBox(0, 0, 0.13, 0.09, 0.09, 0.10, mGem);
    addBox(0, 0, 0.34, 0.09, 0.14, 0.38, mBlade);
    addBox(0, 0, 0.56, 0.05, 0.09, 0.16, mEdge);
    addBox(0, 0, 0.34, 0.11, 0.04, 0.30, mEdge);
  } else if (model === 'bow') {
    const bowMat = new THREE.MeshLambertMaterial({
      color: def.tint || 0x92400e,
      emissive: glow.emissive,
      emissiveIntensity: glow.intensity * 0.5,
    });
    addBox(0, 0, 0, 0.10, 0.42, 0.11, mWrap);
    addBox(0, 0.0, 0.06, 0.12, 0.14, 0.06, mGuard);
    addBox(0, 0.32, -0.09, 0.09, 0.36, 0.09, bowMat, 0.40);
    addBox(0, 0.58, -0.22, 0.08, 0.22, 0.08, mGuard, 0.62);
    addBox(0, -0.32, -0.09, 0.09, 0.36, 0.09, bowMat, -0.40);
    addBox(0, -0.58, -0.22, 0.08, 0.22, 0.08, mGuard, -0.62);
    addBox(0, 0, -0.24, 0.025, 1.16, 0.025, new THREE.MeshBasicMaterial({ color: 0xf8fafc }));
    // Fletched glowing broadhead arrow
    addBox(0, 0, 0.12, 0.05, 0.05, 0.68, mHandle);
    addBox(0, 0, 0.48, 0.11, 0.11, 0.16, mBlade);
    addBox(0, 0, -0.18, 0.14, 0.03, 0.14, mGem);
  } else if (model === 'spear') {
    addBox(0, 0, 0.32, 0.08, 0.08, 1.38, mHandle);
    addBox(0, 0, -0.34, 0.11, 0.11, 0.12, mGuard);
    addBox(0, 0, 0.10, 0.10, 0.10, 0.28, mWrap);
    addBox(0, 0, 0.96, 0.18, 0.18, 0.12, mGuard);
    addBox(0, 0, 1.00, 0.34, 0.08, 0.08, mGuard);
    addBox(0, 0, 0.94, 0.10, 0.22, 0.12, new THREE.MeshLambertMaterial({ color: 0xdc2626 }));
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.48, 4), mBlade);
    tip.rotation.x = Math.PI / 2;
    tip.position.z = 1.24;
    g.add(tip);
    addBox(0, 0, 1.12, 0.08, 0.18, 0.22, mGem);
  } else if (model === 'sword') {
    addBox(0, 0, -0.02, 0.09, 0.09, 0.24, mWrap);
    addBox(0, 0, -0.16, 0.14, 0.14, 0.09, mGuard);
    addBox(0, 0, 0.14, 0.44, 0.11, 0.10, mGuard);
    addBox(-0.22, 0, 0.18, 0.08, 0.11, 0.12, mGuard);
    addBox(0.22, 0, 0.18, 0.08, 0.11, 0.12, mGuard);
    addBox(0, 0, 0.15, 0.11, 0.13, 0.12, mGem);
    addBox(0, 0, 0.58, 0.13, 0.16, 0.78, mBlade);
    addBox(0, 0, 0.56, 0.15, 0.05, 0.68, mEdge);
    addBox(0, 0, 1.04, 0.08, 0.11, 0.18, mEdge);
  } else if (model === 'axe') {
    addBox(0, 0, 0.26, 0.10, 0.10, 1.10, mHandle);
    addBox(0, 0, -0.28, 0.14, 0.14, 0.10, mGuard);
    addBox(0, 0, 0.06, 0.12, 0.12, 0.26, mWrap);
    addBox(0, 0, 0.68, 0.18, 0.22, 0.24, mGuard);
    addBox(0, 0, 0.68, 0.22, 0.14, 0.14, mGem);
    // Double-beveled crescent battle-axe wings + top pike
    addBox(-0.20, 0, 0.68, 0.28, 0.44, 0.26, mBlade);
    addBox(-0.34, 0, 0.68, 0.08, 0.52, 0.16, mEdge);
    addBox(0.20, 0, 0.68, 0.28, 0.44, 0.26, mBlade);
    addBox(0.34, 0, 0.68, 0.08, 0.52, 0.16, mEdge);
    addBox(0, 0, 0.92, 0.08, 0.10, 0.26, mEdge);
  }

  g.userData.glowMaterials = [mBlade, mEdge, mGuard, mGem];
  return g;
}

// Floating Percentage Health Bar ("100%", "67%", etc.)
function makePercentHpSprite(hp, maxHp, isBoss = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 36;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const draw = (cur) => {
    const pct = Math.max(0, Math.min(100, Math.ceil((cur / maxHp) * 100)));
    ctx.clearRect(0, 0, 128, 36);
    ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
    ctx.fillRect(4, 4, 120, 28);
    ctx.strokeStyle = isBoss ? '#facc15' : '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, 118, 26);

    const barCol = pct > 60 ? '#22c55e' : pct > 30 ? '#facc15' : '#ef4444';
    const fillW = Math.round(110 * (pct / 100));
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(9, 9, 110, 18);
    ctx.fillStyle = barCol;
    ctx.fillRect(9, 9, fillW, 18);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isBoss ? `BOSS ${pct}%` : `${pct}%`, 64, 19);
  };
  draw(hp);

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sprite.scale.set(isBoss ? 2.4 : 1.85, isBoss ? 0.66 : 0.52, 1);
  return { sprite, redraw: (cur) => { draw(cur); tex.needsUpdate = true; } };
}

function makeNameplateSprite(text, color = '#fda4af') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 44;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(2, 6, 23, 0.82)';
  ctx.fillRect(6, 4, 244, 36);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.strokeRect(7, 5, 242, 34);
  ctx.fillStyle = color;
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 22);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sprite.scale.set(3.4, 0.62, 1);
  return sprite;
}

export class CombatSystem {
  constructor(scene, world, saveState, callbacks) {
    this.scene = scene;
    this.world = world;
    this.saveState = saveState;
    this.cb = callbacks;

    this.root = new THREE.Group();
    this.scene.add(this.root);

    this.enemies = [];
    this.allies = [];
    this.projectiles = [];
    this.drops = [];
    this.coins = [];
    this.heartStones = [];
    this.slashEffects = [];
    this.dummy = null;

    // Live 3D Auto-Aim Target Lock Ring beneath the locked enemy
    const lockGeo = new THREE.RingGeometry(0.75, 0.98, 20);
    lockGeo.rotateX(-Math.PI / 2);
    this.lockRing = new THREE.Mesh(
      lockGeo,
      new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.9, depthTest: false })
    );
    this.lockRing.visible = false;
    this.root.add(this.lockRing);
    this.lockedTarget = null;
    this.crosshairTarget = null;
    this.aimRaycaster = new THREE.Raycaster();
    this.aimWorldPoint = new THREE.Vector3();
    this.hasAimWorldPoint = false;
  }

  // Pinpoint 3rd-Person Shooter Crosshair Raycast:
  // Raycasts against world colliders, water ponds/fountain, ground, AND enemies so every stone/knife/arrow hits DEAD-CENTER on the green cross!
  updateCrosshairAim(camera, player, ndcX = 0, ndcY = 0.24, maxRange = 38) {
    this.crosshairTarget = null;
    this.hasAimWorldPoint = false;
    if (!camera) return null;

    this.aimRaycaster.setFromCamera({ x: ndcX, y: ndcY }, camera);
    const ray = this.aimRaycaster.ray;
    const ro = ray.origin;
    const rd = ray.direction;

    // 1. Exact raycast against ALL world colliders & water surfaces to eliminate shoulder-camera parallax!
    let hitT = maxRange;
    const minT = 1.6;
    for (const wz of this.world?.waterZones || []) {
      if (Math.abs(rd.y) > 0.001) {
        const t = (wz.y - ro.y) / rd.y;
        if (t > minT && t < hitT) {
          const hx = ro.x + rd.x * t;
          const hz = ro.z + rd.z * t;
          if (hx >= wz.minX && hx <= wz.maxX && hz >= wz.minZ && hz <= wz.maxZ) {
            hitT = t;
          }
        }
      }
    }
    for (const c of this.world?.colliders || []) {
      if (c.disabled) continue;
      let tmin = minT;
      let tmax = hitT;
      const axes = [
        [ro.x, rd.x, c.minX, c.maxX],
        [ro.y, rd.y, c.minY, c.maxY],
        [ro.z, rd.z, c.minZ, c.maxZ],
      ];
      let hit = true;
      for (const [o, d, bmin, bmax] of axes) {
        if (Math.abs(d) < 1e-6) {
          if (o < bmin || o > bmax) { hit = false; break; }
        } else {
          let t1 = (bmin - o) / d;
          let t2 = (bmax - o) / d;
          if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
          if (t1 > tmin) tmin = t1;
          if (t2 < tmax) tmax = t2;
          if (tmin > tmax) { hit = false; break; }
        }
      }
      if (hit && tmin < hitT) hitT = tmin;
    }

    this.aimWorldPoint.copy(ro).addScaledVector(rd, hitT);
    this.hasAimWorldPoint = true;

    // 2. Check enemies & Training Dummy (ignoring enemies completely occluded behind solid walls!)
    const candidates = [...this.enemies.filter((e) => !e.dead)];
    if (this.dummy) candidates.push({ pos: this.dummy.pos, isDummy: true, isBoss: false });

    let best = null;
    let bestScore = Infinity;
    const chest = new THREE.Vector3();
    const closestPt = new THREE.Vector3();

    for (const c of candidates) {
      const distFromPlayer = player.pos.distanceTo(c.pos);
      if (distFromPlayer > maxRange) continue;
      chest.set(c.pos.x, c.pos.y + (c.isBoss ? 1.25 : 0.95), c.pos.z);
      const toChest = chest.clone().sub(ro);
      const along = toChest.dot(rd);
      if (along < 1.5 || along > hitT + 1.4) continue;
      ray.closestPointToPoint(chest, closestPt);
      const perpDist = closestPt.distanceTo(chest);
      const hitTol = (c.isBoss ? 1.55 : 1.05) + along * 0.022;
      if (perpDist <= hitTol) {
        const score = perpDist * 4.5 + along * 0.12;
        if (score < bestScore) {
          bestScore = score;
          best = c;
        }
      }
    }
    this.crosshairTarget = best;
    if (best) {
      this.aimWorldPoint.set(best.pos.x, best.pos.y + (best.isBoss ? 1.25 : 0.95), best.pos.z);
    }
    return best;
  }

  clear() {
    this.disposeObject(this.root);
    this.scene.remove(this.root);
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.enemies = [];
    this.allies = [];
    this.projectiles = [];
    this.drops = [];
    this.coins = [];
    this.heartStones = [];
    this.slashEffects = [];
    this.dummy = null;
    this.lockedTarget = null;

    const lockGeo = new THREE.RingGeometry(0.75, 0.98, 20);
    lockGeo.rotateX(-Math.PI / 2);
    this.lockRing = new THREE.Mesh(
      lockGeo,
      new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.9, depthTest: false })
    );
    this.lockRing.visible = false;
    this.root.add(this.lockRing);
  }

  // True 360-degree smart auto-aim target finder (prioritizes nearest alive NPC in range!)
  findAutoTarget(player, maxRange = 24) {
    const forward = new THREE.Vector3(Math.sin(player.facingYaw), 0, Math.cos(player.facingYaw));
    let best = null;
    let bestScore = Infinity;

    const list = [...this.enemies.filter((e) => !e.dead)];
    if (this.dummy) list.push({ pos: this.dummy.pos, isDummy: true, isBoss: false });

    for (const c of list) {
      const dx = c.pos.x - player.pos.x;
      const dy = c.pos.y - player.pos.y;
      const dz = c.pos.z - player.pos.z;
      const dist = Math.hypot(dx, dz);
      if (dist > maxRange || Math.abs(dy) > 7.5) continue;
      // Slightly favor enemies in front of the player, while still locking 360° onto nearby foes!
      const dir = new THREE.Vector3(dx, 0, dz).normalize();
      const alignPenalty = (1 - dir.dot(forward)) * 2.2;
      const score = dist + alignPenalty;
      if (score < bestScore) {
        bestScore = score;
        best = c;
      }
    }
    return best;
  }

  disposeObject(obj) {
    if (!obj) return;
    obj.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const list = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of list) {
          if (m.map && m.map.isCanvasTexture && !m.map.userData?.shared) m.map.dispose();
          m.dispose();
        }
      }
    });
  }

  spawnTrainingDummy(pos) {
    const g = new THREE.Group();
    g.position.set(pos.x, pos.y, pos.z);
    const wood = new THREE.MeshLambertMaterial({ color: 0x92400e });
    const straw = new THREE.MeshLambertMaterial({ color: 0xeab308 });
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.3, 0.24), wood);
    post.position.y = 0.65;
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.72, 0.45), straw);
    body.position.y = 1.05;
    const arms = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.18, 0.18), wood);
    arms.position.y = 1.15;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.44, 0.44), straw);
    head.position.y = 1.64;
    const hpUi = makePercentHpSprite(100, 100, false);
    hpUi.sprite.position.set(0, 2.25, 0);
    g.add(post, body, arms, head, hpUi.sprite);
    this.root.add(g);
    this.dummy = { group: g, pos: new THREE.Vector3(pos.x, pos.y, pos.z), hp: 100, maxHp: 100, hpUi, wobble: 0 };
  }

  spawnEnemies(enemyDefs) {
    const gDiff = getGuildDifficulty(this.saveState);
    for (const def of enemyDefs) {
      const scaledMaxHp = Math.round(def.maxHp * gDiff.hpMult);
      const scaledSpeed = (def.speed || 2.8) * gDiff.speedMult;
      const scaledFireRate = Math.max(0.45, (def.fireRate || 1.6) * gDiff.fireRateMult);

      const g = new THREE.Group();
      const sc = def.isBoss ? 1.38 : 1.0;
      g.scale.setScalar(sc);
      g.position.set(def.x, def.y, def.z);

      const bHex = '#' + (def.bodyColor || 0x334155).toString(16).padStart(6, '0');
      const aHex = '#' + (def.accentColor || 0xfacc15).toString(16).padStart(6, '0');
      const cTex = makeCharacterTextures(bHex, aHex, '#1e293b');
      const mBody = new THREE.MeshLambertMaterial({ map: cTex.tunicTex });
      const mSleeve = new THREE.MeshLambertMaterial({ map: cTex.sleeveTex });
      const mBoots = new THREE.MeshLambertMaterial({ map: cTex.bootTex });
      const mCape = new THREE.MeshLambertMaterial({ map: cTex.capeTex });
      const mDark = new THREE.MeshLambertMaterial({ color: 0x1e293b });
      const mHead = new THREE.MeshLambertMaterial({ color: def.isAiPlayer ? (def.aiProfile?.skin || 0xffd1a9) : 0x334155 });
      const mEye = new THREE.MeshBasicMaterial({ color: def.isAiPlayer ? 0x0f172a : (def.type === 'archer' ? 0x38bdf8 : 0xfef08a) });
      const mAcc = new THREE.MeshLambertMaterial({ color: def.accentColor });

      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.48, 0.24), mBoots);
      legL.position.set(-0.14, 0.24, 0);
      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.48, 0.24), mBoots);
      legR.position.set(0.14, 0.24, 0);

      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.58, 0.36), mBody);
      torso.position.set(0, 0.74, 0);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.44, 0.44), mHead);
      head.position.set(0, 1.24, 0);

      if (def.isAiPlayer) {
        // Stylized 32x32 Textured Voxel Player Hero Look for Arena AI Challengers!
        const cape = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.58, 0.08), mCape);
        cape.position.set(0, 0.74, -0.22);
        const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.06), mEye);
        eyeL.position.set(-0.1, 1.26, 0.22);
        const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.06), mEye);
        eyeR.position.set(0.1, 1.26, 0.22);
        const mHat = new THREE.MeshLambertMaterial({ color: def.aiProfile?.hatColor || 0xfacc15 });
        const brim = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.1, 0.62), mHat);
        brim.position.set(0, 1.50, 0);
        const crown = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.18, 0.44), mHat);
        crown.position.set(0, 1.62, 0);
        g.add(cape, eyeL, eyeR, brim, crown);
      } else {
        // Graphic-Artist Sculpted Guardian Armor, Belt, Visor Eyes & Spiked Helm!
        const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.34, 0.42), mAcc);
        chestPlate.position.set(0, 0.78, 0.02);
        const belt = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.11, 0.40), mDark);
        belt.position.set(0, 0.50, 0);
        const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.08), mAcc);
        buckle.position.set(0, 0.50, 0.21);
        const padL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.40), mAcc);
        padL.position.set(-0.37, 0.96, 0);
        const padR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.40), mAcc);
        padR.position.set(0.37, 0.96, 0);
        const helmBrow = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.14, 0.48), mAcc);
        helmBrow.position.set(0, 1.44, 0.01);
        const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.09, 0.08), mEye);
        eyeL.position.set(-0.11, 1.27, 0.22);
        const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.09, 0.08), mEye);
        eyeR.position.set(0.11, 1.27, 0.22);
        const hornL = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.22, 0.10), mAcc);
        hornL.position.set(-0.26, 1.54, 0);
        hornL.rotation.z = 0.38;
        const hornR = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.22, 0.10), mAcc);
        hornR.position.set(0.26, 1.54, 0);
        hornR.rotation.z = -0.38;
        g.add(chestPlate, belt, buckle, padL, padR, helmBrow, eyeL, eyeR, hornL, hornR);
      }

      if (def.isBoss) {
        const crownMat = new THREE.MeshLambertMaterial({ color: 0xfacc15, emissive: 0xd97706, emissiveIntensity: 0.7 });
        const crown = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.16, 0.52), crownMat);
        crown.position.set(0, def.isAiPlayer ? 1.76 : 1.58, 0);
        for (const cx of [-0.20, 0, 0.20]) {
          const sp = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.18, 0.10), crownMat);
          sp.position.set(cx, def.isAiPlayer ? 1.90 : 1.72, 0.18);
          g.add(sp);
        }
        if (!def.isAiPlayer) {
          const bossCape = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.72, 0.09), mAcc);
          bossCape.position.set(0, 0.72, -0.24);
          bossCape.rotation.x = 0.14;
          g.add(bossCape);
        }
        g.add(crown);
      }

      // Guild Hard Mode visual crimson-violet elite aura ring around enemy feet!
      if (gDiff.active) {
        const aura = new THREE.Mesh(
          new THREE.RingGeometry(0.52, 0.68, 14),
          new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
        );
        aura.rotation.x = -Math.PI / 2;
        aura.position.y = 0.06;
        g.add(aura);
      }

      const mHand = new THREE.MeshLambertMaterial({ color: def.isAiPlayer ? (def.aiProfile?.skin || 0xffd1a9) : 0x94a3b8 });
      const armL = new THREE.Group();
      armL.position.set(-0.38, 0.88, 0);
      const armLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.34, 0.18), mSleeve);
      armLMesh.position.y = -0.14;
      const handLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.16), mHand);
      handLMesh.position.y = -0.36;
      armL.add(armLMesh, handLMesh);

      const armR = new THREE.Group();
      armR.position.set(0.38, 0.88, 0);
      const armRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.34, 0.18), mSleeve);
      armRMesh.position.y = -0.14;
      const handRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.16), mHand);
      handRMesh.position.y = -0.36;
      armR.add(armRMesh, handRMesh);

      const wId = def.weaponId || (def.type === 'archer' ? 'bow' : (def.dropWeapon === 'bow' ? 'sword' : def.dropWeapon));
      const wLvl = def.weaponLvl || (def.isBoss ? 4 : gDiff.active ? 3 : 1);
      if (def.type === 'archer') {
        const bow = buildWeaponMesh(wId, wLvl);
        bow.position.set(0, -0.26, 0.3);
        armR.add(bow);
        armR.rotation.x = -Math.PI / 2.2;
      } else {
        const meleeWpn = buildWeaponMesh(wId, wLvl);
        meleeWpn.position.set(0, -0.34, 0.18);
        armR.add(meleeWpn);
      }

      const hpUi = makePercentHpSprite(scaledMaxHp, scaledMaxHp, def.isBoss);
      hpUi.sprite.position.set(0, 2.02, 0);
      g.add(legL, legR, torso, head, armL, armR, hpUi.sprite);

      if (def.displayName) {
        const np = makeNameplateSprite(def.displayName, def.isBoss ? '#facc15' : '#fda4af');
        np.position.set(0, 2.65, 0);
        g.add(np);
      }

      g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      this.root.add(g);

      this.enemies.push({
        group: g, legL, legR, armL, armR, bodyMat: mBody, baseColor: def.bodyColor, hpUi,
        type: def.type, isBoss: !!def.isBoss,
        isAiPlayer: !!def.isAiPlayer,
        smartAi: !!def.isAiPlayer || gDiff.smartAi,
        displayName: def.displayName || '',
        hp: scaledMaxHp, maxHp: scaledMaxHp,
        coins: def.coins || 12,
        dropWeapon: def.dropWeapon || 'knife',
        speed: scaledSpeed,
        fireRate: scaledFireRate,
        home: new THREE.Vector3(def.x, def.y, def.z),
        pos: new THREE.Vector3(def.x, def.y, def.z),
        baseY: def.y,
        jumpY: 0, jumpVel: 0,
        patrolR: def.patrolR || 4.5,
        patrolAngle: Math.random() * Math.PI * 2,
        strafeDir: Math.random() < 0.5 ? 1 : -1,
        strafeTimer: 1.0 + Math.random() * 1.4,
        dashCd: 1.8 + Math.random() * 1.4,
        dashTimer: 0,
        dashDir: new THREE.Vector3(),
        yaw: 0, cooldown: 0.6 + Math.random() * 0.5,
        attackAnim: 0, hitFlash: 0, walkCycle: Math.random() * 5,
        dead: false,
      });
    }
  }

  spawnAllies(allyDefs) {
    for (const def of allyDefs || []) {
      const g = new THREE.Group();
      g.position.set(def.x, def.y, def.z);
      const mTunic = new THREE.MeshLambertMaterial({ color: def.tunic || 0x0284c7 });
      const mCape = new THREE.MeshLambertMaterial({ color: def.cape || 0x38bdf8 });
      const mSkin = new THREE.MeshLambertMaterial({ color: def.skin || 0xffd1a9 });
      const mHat = new THREE.MeshLambertMaterial({ color: def.hatColor || 0x38bdf8 });
      const mDark = new THREE.MeshLambertMaterial({ color: 0x1e293b });

      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.46, 0.22), mDark);
      legL.position.set(-0.14, 0.23, 0);
      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.46, 0.22), mDark);
      legR.position.set(0.14, 0.23, 0);
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.58, 0.34), mTunic);
      torso.position.set(0, 0.74, 0);
      const cape = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.56, 0.08), mCape);
      cape.position.set(0, 0.74, -0.22);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.44, 0.44), mSkin);
      head.position.set(0, 1.24, 0);
      const brim = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.6), mHat);
      brim.position.set(0, 1.50, 0);
      const armL = new THREE.Group();
      armL.position.set(-0.38, 0.88, 0);
      const armLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.34, 0.18), mTunic);
      armLMesh.position.y = -0.14;
      const handLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.16), mSkin);
      handLMesh.position.y = -0.36;
      armL.add(armLMesh, handLMesh);

      const armR = new THREE.Group();
      armR.position.set(0.38, 0.88, 0);
      const armRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.34, 0.18), mTunic);
      armRMesh.position.y = -0.14;
      const handRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.16), mSkin);
      handRMesh.position.y = -0.36;
      const bow = buildWeaponMesh(def.weapon || 'storm_bow', def.weaponLvl || 3);
      bow.position.set(0, -0.30, 0.3);
      armR.add(armRMesh, handRMesh, bow);
      armR.rotation.x = -Math.PI / 2.2;

      const np = makeNameplateSprite(def.displayName || 'Guild Ally', '#34d399');
      np.position.set(0, 2.25, 0);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.46, 0.62, 14),
        new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.06;

      g.add(legL, legR, torso, cape, head, brim, armL, armR, np, ring);
      g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      this.root.add(g);

      this.allies.push({
        group: g, legL, legR, armR,
        pos: new THREE.Vector3(def.x, def.y, def.z),
        speed: def.speed || 5.2,
        damage: def.damage || 22,
        yaw: 0, cooldown: 0.5, strafeDir: 1, strafeTimer: 1.5, walkCycle: 0,
      });
    }
  }

  playerAttack(player) {
    const eqItem = getEquippedItem(this.saveState);
    const wId = eqItem.weaponId;
    const def = WEAPON_CATALOG[wId] || WEAPON_CATALOG.stone;
    const model = def.model || wId;
    const wLvl = eqItem.level || 1;
    const glow = getGlowTier(wLvl);
    const dmg = getItemDamage(this.saveState, eqItem);

    // 3rd-Person Shooter Aim Priority (respects OPTION -> AUTO-AIM ON/OFF!):
    const autoAimOn = this.saveState.autoAim !== false;
    const isRanged = model === 'stone' || model === 'knife' || model === 'bow';
    const lockRange = isRanged ? Math.max(def.range + 6, 34) : Math.max(def.range + 3.5, 8.5);
    const target = autoAimOn
      ? (this.crosshairTarget || this.findAutoTarget(player, lockRange))
      : this.crosshairTarget;
    this.lockedTarget = target;

    let aimPt = null;
    if (target) {
      aimPt = target.pos.clone().add(new THREE.Vector3(0, target.isBoss ? 1.2 : 0.95, 0));
    } else if (this.hasAimWorldPoint) {
      aimPt = this.aimWorldPoint.clone();
    }

    if (aimPt && (isRanged || (target && autoAimOn))) {
      const dx = aimPt.x - player.pos.x;
      const dz = aimPt.z - player.pos.z;
      if (Math.hypot(dx, dz) > 0.15) {
        player.facingYaw = Math.atan2(dx, dz);
      }
    }

    const forward = new THREE.Vector3(Math.sin(player.facingYaw), 0, Math.cos(player.facingYaw)).normalize();
    const origin = player.pos.clone().add(new THREE.Vector3(0, 1.02, 0)).addScaledVector(forward, 0.52);

    if (!aimPt) aimPt = origin.clone().addScaledVector(forward, 16);

    // Exact Ballistic Launch Solver: guarantees stone/knife/arrow lands DEAD-CENTER on the exact green crosshair point!
    const solveBallistic = (speed, gravity) => {
      const dx = aimPt.x - origin.x;
      const dy = aimPt.y - origin.y;
      const dz = aimPt.z - origin.z;
      const horiz = Math.hypot(dx, dz);
      const dist3d = Math.hypot(horiz, dy);
      const t = Math.max(0.05, Math.min(1.35, (horiz > 0.4 ? horiz : dist3d) / speed));
      return new THREE.Vector3(dx / t, (dy + 0.5 * gravity * t * t) / t, dz / t);
    };

    const fxColor = wLvl > 1 ? glow.color : (def.tint || 0x67e8f9);

    if (model === 'stone') {
      audio.playThrow();
      const mesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.24, 0),
        new THREE.MeshLambertMaterial({ color: wLvl > 1 ? glow.color : 0x94a3b8, emissive: glow.emissive, emissiveIntensity: glow.intensity * 0.7 })
      );
      mesh.position.copy(origin);
      this.root.add(mesh);
      const vel = solveBallistic(21.0, 15.5);
      this.projectiles.push({ mesh, pos: origin.clone(), prevPos: origin.clone(), vel, gravity: 15.5, fromPlayer: true, damage: dmg, life: 1.9, color: fxColor, spin: true });
    } else if (model === 'knife') {
      audio.playThrow();
      const vel = solveBallistic(28.0, 1.4);
      const mesh = buildWeaponMesh(wId, wLvl);
      mesh.position.copy(origin);
      mesh.lookAt(origin.clone().add(vel));
      this.root.add(mesh);
      this.projectiles.push({ mesh, pos: origin.clone(), prevPos: origin.clone(), vel, gravity: 1.4, fromPlayer: true, damage: dmg, life: 1.4, color: fxColor, spin: false });
    } else if (model === 'bow') {
      audio.playBow();
      const arrowType = getEquippedArrow(this.saveState);
      const arrowCol = arrowType.id === 'wood' ? fxColor : arrowType.color;
      const speed = arrowType.id === 'lightning' ? 38 : 32;
      const vel = solveBallistic(speed, 1.8);
      const arrowGroup = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.76), new THREE.MeshBasicMaterial({ color: arrowCol }));
      const fletch = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.14), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      fletch.position.z = -0.32;
      arrowGroup.add(shaft, fletch);
      arrowGroup.position.copy(origin);
      arrowGroup.lookAt(origin.clone().add(vel));
      this.root.add(arrowGroup);
      this.projectiles.push({ mesh: arrowGroup, pos: origin.clone(), prevPos: origin.clone(), vel, gravity: 1.8, fromPlayer: true, damage: dmg, life: 1.6, color: arrowCol, spin: false });
    } else {
      audio.playSlash();
      if (model === 'dagger') {
        player.vel.x += forward.x * 5.2;
        player.vel.z += forward.z * 5.2;
      }

      const ringGeo = model === 'spear'
        ? new THREE.BoxGeometry(0.4, 0.25, def.range * 0.85)
        : new THREE.RingGeometry(0.35, model === 'axe' ? 0.92 : 0.65, 16);
      const fxMesh = new THREE.Mesh(
        ringGeo,
        new THREE.MeshBasicMaterial({ color: fxColor, side: THREE.DoubleSide, transparent: true, opacity: 0.88 })
      );
      if (model === 'spear') {
        fxMesh.position.copy(origin).addScaledVector(forward, def.range * 0.42);
        fxMesh.lookAt(fxMesh.position.clone().add(forward));
      } else {
        fxMesh.rotation.x = -Math.PI / 2;
        fxMesh.position.copy(player.pos).add(new THREE.Vector3(0, 0.75, 0)).addScaledVector(forward, 1.15);
      }
      this.root.add(fxMesh);
      this.slashEffects.push({ mesh: fxMesh, life: 0.22, maxLife: 0.22, expand: model !== 'spear', maxScale: def.range * 0.85 });

      const hitOrigin = player.pos.clone().add(new THREE.Vector3(0, 0.8, 0));
      const strikeCenter = hitOrigin.clone().addScaledVector(forward, def.range * 0.45);
      const hitRadius = model === 'axe' ? def.range * 0.8 : def.range * 0.68;

      // Melee Water Splash! Swinging any blade/spear/dagger/axe into or over a pond or fountain triggers water splashes!
      if (this.world?.waterZones?.length && this.world.spawnWaterSplash) {
        const reach = def.range + 1.15;
        const probe = player.pos.clone().addScaledVector(forward, Math.min(reach, 2.2));
        for (const wz of this.world.waterZones) {
          const cx = Math.max(wz.minX, Math.min(wz.maxX, probe.x));
          const cz = Math.max(wz.minZ, Math.min(wz.maxZ, probe.z));
          if (Math.hypot(cx - player.pos.x, cz - player.pos.z) <= reach && Math.abs(wz.y - (player.pos.y + 0.7)) < 2.2) {
            this.world.spawnWaterSplash(new THREE.Vector3(cx, wz.y, cz), model === 'axe' ? 1.35 : 1.05);
            break;
          }
        }
      }

      for (const e of this.enemies) {
        if (e.dead) continue;
        const ec = e.pos.clone().add(new THREE.Vector3(0, 0.85, 0));
        if (ec.distanceTo(strikeCenter) <= hitRadius) {
          this.damageEnemy(e, dmg, forward, model === 'axe' ? 1.5 : 0.85);
        }
      }
      if (this.dummy && this.dummy.pos.clone().add(new THREE.Vector3(0, 0.9, 0)).distanceTo(strikeCenter) <= hitRadius) {
        this.hitDummy(dmg);
      }
    }
  }

  hitDummy(dmg) {
    if (!this.dummy) return;
    audio.playEnemyHit();
    this.dummy.hp -= dmg;
    if (this.dummy.hp <= 0) this.dummy.hp = this.dummy.maxHp;
    this.dummy.wobble = 0.35;
    this.dummy.hpUi.redraw(this.dummy.hp);
    this.world.spawnBurst(this.dummy.pos.clone().add(new THREE.Vector3(0, 1.1, 0)), 0xfacc15, 8, 3.8);
  }

  damageEnemy(e, dmg, hitDir, knockMult = 0.85) {
    if (e.dead) return;
    e.hp = Math.max(0, e.hp - dmg);
    e.hitFlash = 0.15;
    e.hpUi.redraw(e.hp);
    this.world.spawnBurst(e.pos.clone().add(new THREE.Vector3(0, 0.9, 0)), 0xfef08a, 8, 4.0);

    if (hitDir) {
      const nx = e.pos.x + hitDir.x * knockMult;
      const nz = e.pos.z + hitDir.z * knockMult;
      if (Math.hypot(nx - e.home.x, nz - e.home.z) <= e.patrolR + 0.8) {
        e.pos.x = nx;
        e.pos.z = nz;
      }
    }

    if (e.hp <= 0) {
      e.dead = true;
      e.group.visible = false;
      audio.playEnemyDie();
      this.world.spawnBurst(e.pos.clone().add(new THREE.Vector3(0, 0.9, 0)), e.baseColor, 18, 5.5);

      // OWNER-FAIR ECONOMY: Enemies do NOT drop loot on every single kill!
      // Normal enemies have a 65% chance to drop modest Credit Coins; Bosses always drop a Boss Coin Pile.
      const coinBonus = this.saveState.guild?.bonusType === 'coins' ? (1 + (this.saveState.guild.bonusVal || 0.12)) : 1;
      if (e.isBoss || Math.random() < 0.65) {
        const coinTotal = Math.max(4, Math.round(e.coins * coinBonus));
        this.spawnCoins(e.pos, coinTotal, e.isBoss ? 6 : 3, e.home, e.patrolR);
      }

      // ULTRA-RARE WEAPON DROPS: Normal NPCs 3% (~1 in 33), Bosses 12% (never guaranteed!)
      const luckBonus = this.saveState.guild?.bonusType === 'luck' ? (this.saveState.guild.bonusVal || 0.10) : 0;
      const dropChance = e.isBoss ? (0.12 + luckBonus * 0.4) : (0.03 + luckBonus * 0.15);
      if (Math.random() < dropChance) {
        this.spawnWeaponDrop(e.pos, e.dropWeapon);
      }
      // 1UP HEART STONE DROPS: Bosses always drop a 1UP Heart Stone; Normal foes have 28% chance!
      if (e.isBoss || Math.random() < 0.28) {
        const hsPos = e.pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.4, 0, (Math.random() - 0.5) * 1.4));
        this.spawnHeartStone(hsPos);
      }
      if (this.cb.onEnemyDefeated) this.cb.onEnemyDefeated(e.isBoss);
    } else {
      audio.playEnemyHit();
    }
  }

  getObjectiveStatus() {
    const total = this.enemies.length;
    if (total === 0) return { total: 0, defeated: 0, required: 0, bossAlive: false, unlocked: true };
    let defeated = 0;
    let bossAlive = false;
    for (const e of this.enemies) {
      if (e.dead) defeated += 1;
      else if (e.isBoss) bossAlive = true;
    }
    const required = Math.max(1, Math.ceil(total * 0.65));
    const unlocked = !bossAlive && defeated >= required;
    return { total, defeated, required, bossAlive, unlocked };
  }

  spawnCoins(origin, totalValue, count = 3, anchor = origin, maxR = 4.5) {
    const perCoin = Math.max(2, Math.round(totalValue / count));
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.08, 10),
        new THREE.MeshLambertMaterial({ color: 0xfacc15, emissive: 0xd97706, emissiveIntensity: 0.65 })
      );
      mesh.rotation.z = Math.PI / 2;
      mesh.position.set(origin.x, origin.y + 0.85, origin.z);
      this.root.add(mesh);
      const ang = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      this.coins.push({
        mesh,
        pos: mesh.position.clone(),
        vel: new THREE.Vector3(Math.cos(ang) * (2.0 + Math.random() * 1.2), 4.5 + Math.random() * 2.0, Math.sin(ang) * (2.0 + Math.random() * 1.2)),
        groundY: origin.y + 0.38,
        anchor: anchor.clone(),
        maxR,
        value: perCoin,
        collected: false,
      });
    }
  }

  spawnWeaponDrop(origin, weaponId) {
    const g = new THREE.Group();
    g.position.set(origin.x, origin.y + 0.85, origin.z);
    const visual = buildWeaponMesh(weaponId, 2);
    visual.scale.setScalar(1.25);
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.45, 0.62, 12),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = -0.5;
    g.add(visual, halo);
    this.root.add(g);
    this.drops.push({ group: g, baseY: origin.y + 0.85, weaponId, collected: false });
  }

  // Glowing 3D Voxel 1UP Heart Stone (restores +1 Heart up to 3, or +1 Armor Shield if hearts are full!)
  spawnHeartStone(origin) {
    const g = new THREE.Group();
    const ox = origin.x ?? 0;
    const oy = origin.y ?? 0;
    const oz = origin.z ?? 0;
    g.position.set(ox, oy + 0.88, oz);

    const heartGroup = new THREE.Group();
    const mRuby = new THREE.MeshLambertMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.72 });
    const mShine = new THREE.MeshBasicMaterial({ color: 0xfecdd3 });
    const mGold = new THREE.MeshLambertMaterial({ color: 0xfacc15, emissive: 0xd97706, emissiveIntensity: 0.45 });

    // Classic voxel heart silhouette (bottom point, wide mid, two upper lobes + sparkling specular highlight!)
    const parts = [
      [0, -0.24, 0, 0.22, 0.20, 0.22, mRuby],
      [0, -0.06, 0, 0.48, 0.22, 0.24, mRuby],
      [0,  0.12, 0, 0.66, 0.20, 0.26, mRuby],
      [-0.17, 0.27, 0, 0.26, 0.16, 0.24, mRuby],
      [ 0.17, 0.27, 0, 0.26, 0.16, 0.24, mRuby],
      [-0.18, 0.24, 0.12, 0.10, 0.10, 0.06, mShine],
      // Small golden crystal base rim
      [0, -0.37, 0, 0.14, 0.10, 0.14, mGold],
    ];
    for (const [px, py, pz, w, h, d, mat] of parts) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      b.position.set(px, py, pz);
      b.castShadow = true;
      heartGroup.add(b);
    }

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.42, 0.60, 16),
      new THREE.MeshBasicMaterial({
        color: 0xfb7185, side: THREE.DoubleSide, transparent: true, opacity: 0.78,
        depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
      })
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = -0.84;

    const lbl = makeNameplateSprite('1UP ♥', '#fda4af');
    lbl.scale.set(2.0, 0.48, 1);
    lbl.position.y = 0.85;

    g.add(heartGroup, halo, lbl);
    this.root.add(g);
    this.heartStones.push({
      group: g,
      heartGroup,
      halo,
      baseY: oy + 0.88,
      pos: g.position.clone(),
      collected: false,
    });
  }

  spawnHeartStones(defs) {
    for (const hs of defs || []) {
      this.spawnHeartStone(hs);
    }
  }

  update(dt, elapsed, player) {
    const playerCenter = player.pos.clone().add(new THREE.Vector3(0, 0.8, 0));

    // Update live 3D Auto-Aim Target Lock Reticle (respects AUTO-AIM ON/OFF!)
    const autoAimOn = this.saveState.autoAim !== false;
    const eqDef = WEAPON_CATALOG[getEquippedItem(this.saveState).weaponId] || WEAPON_CATALOG.stone;
    const lockRange = (eqDef.model === 'stone' || eqDef.model === 'knife' || eqDef.model === 'bow') ? Math.max(eqDef.range + 4, 28) : Math.max(eqDef.range + 3.5, 8.5);
    this.lockedTarget = autoAimOn ? (this.crosshairTarget || this.findAutoTarget(player, lockRange)) : this.crosshairTarget;
    if (this.lockedTarget && this.lockRing) {
      this.lockRing.visible = true;
      this.lockRing.position.set(this.lockedTarget.pos.x, this.lockedTarget.pos.y + 0.08, this.lockedTarget.pos.z);
      this.lockRing.rotation.z = elapsed * 2.5;
      const sc = (this.lockedTarget.isBoss ? 1.45 : 1.0) * (1 + Math.sin(elapsed * 6) * 0.08);
      this.lockRing.scale.setScalar(sc);
    } else if (this.lockRing) {
      this.lockRing.visible = false;
    }

    // Training Dummy wobble
    if (this.dummy && this.dummy.wobble > 0) {
      this.dummy.wobble = Math.max(0, this.dummy.wobble - dt);
      this.dummy.group.rotation.z = Math.sin(this.dummy.wobble * 28) * 0.25 * (this.dummy.wobble / 0.35);
    }

    // 1. Update Enemy NPCs & Tactical AI Arena Challengers!
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.cooldown = Math.max(0, e.cooldown - dt);
      e.dashCd = Math.max(0, (e.dashCd || 0) - dt);
      e.strafeTimer = (e.strafeTimer || 1.2) - dt;
      if (e.strafeTimer <= 0) {
        e.strafeTimer = 1.1 + Math.random() * 1.4;
        e.strafeDir = -e.strafeDir;
      }

      // Gravity for AI dodge-hops
      if (e.jumpY > 0 || e.jumpVel > 0) {
        e.jumpVel -= 22 * dt;
        e.jumpY = Math.max(0, e.jumpY + e.jumpVel * dt);
        if (e.jumpY <= 0) e.jumpVel = 0;
      }

      if (e.hitFlash > 0) {
        e.hitFlash -= dt;
        e.bodyMat.color.setHex(e.hitFlash > 0 ? 0xffffff : e.baseColor);
      }

      const toPlayer = new THREE.Vector3().subVectors(player.pos, e.pos);
      const horizDist = Math.hypot(toPlayer.x, toPlayer.z);
      const vertDist = Math.abs(toPlayer.y);
      const aggroRange = e.isAiPlayer ? 42.0 : (e.type === 'archer' ? (e.smartAi ? 23.0 : 18.0) : (e.smartAi ? 16.5 : 12.0));
      const seesPlayer = horizDist < aggroRange && vertDist < 6.0 && player.hp > 0;

      // Smart AI Projectile Dodge-Hop (for Arena AI Players & Guild Hard-Mode Enemies!)
      if (e.smartAi && e.jumpY <= 0 && seesPlayer) {
        for (const pr of this.projectiles) {
          if (!pr.fromPlayer) continue;
          const pdx = pr.pos.x - e.pos.x;
          const pdz = pr.pos.z - e.pos.z;
          if (Math.hypot(pdx, pdz) < 4.0) {
            e.jumpVel = 8.4;
            e.strafeDir = -e.strafeDir;
            break;
          }
        }
      }

      const clampMove = (nx, nz) => {
        if (e.isAiPlayer) {
          e.pos.x = Math.max(-17.5, Math.min(17.5, nx));
          e.pos.z = Math.max(-17.5, Math.min(17.5, nz));
          return true;
        }
        if (Math.hypot(nx - e.home.x, nz - e.home.z) <= e.patrolR) {
          e.pos.x = nx; e.pos.z = nz;
          return true;
        }
        return false;
      };

      if (seesPlayer) {
        e.yaw = Math.atan2(toPlayer.x, toPlayer.z);
        const dirX = horizDist > 0.05 ? toPlayer.x / horizDist : 0;
        const dirZ = horizDist > 0.05 ? toPlayer.z / horizDist : 1;
        const perpX = -dirZ * e.strafeDir;
        const perpZ = dirX * e.strafeDir;

        if (e.type === 'brawler') {
          if (e.dashTimer > 0) {
            e.dashTimer -= dt;
            clampMove(e.pos.x + e.dashDir.x * (e.speed * 2.4) * dt, e.pos.z + e.dashDir.z * (e.speed * 2.4) * dt);
            e.walkCycle += dt * 16;
          } else if (e.smartAi && e.dashCd <= 0 && horizDist > 4.2 && horizDist < 11.5) {
            // Tactical Dash Lunge toward the player!
            e.dashCd = e.isBoss ? 2.6 : 3.6;
            e.dashTimer = 0.24;
            e.dashDir.set(dirX, 0, dirZ);
            this.world.spawnBurst(e.pos.clone().add(new THREE.Vector3(0, 0.7, 0)), 0xf43f5e, 8, 4.2);
          } else if (horizDist > 1.85) {
            const strafeWeight = e.smartAi ? 0.55 : 0.0;
            const mx = dirX + perpX * strafeWeight;
            const mz = dirZ + perpZ * strafeWeight;
            const mLen = Math.hypot(mx, mz) || 1;
            if (clampMove(e.pos.x + (mx / mLen) * e.speed * dt, e.pos.z + (mz / mLen) * e.speed * dt)) {
              e.walkCycle += dt * e.speed * 2.1;
            }
          } else if (e.cooldown <= 0) {
            e.cooldown = Math.max(0.55, e.smartAi ? 0.85 : 1.1);
            e.attackAnim = 0.28;
            audio.playPunch();
            player.takeDamage(1, new THREE.Vector3(dirX, 0, dirZ));
          }
        } else {
          // Tactical Ranged AI: Kite backward if too close, orbit-strafe at optimal range, and lead shots!
          if (e.smartAi) {
            const kite = horizDist < 7.0 ? -0.85 : (horizDist > 16.0 ? 0.65 : 0.0);
            const mx = dirX * kite + perpX * 0.95;
            const mz = dirZ * kite + perpZ * 0.95;
            const mLen = Math.hypot(mx, mz) || 1;
            clampMove(e.pos.x + (mx / mLen) * (e.speed * 0.82) * dt, e.pos.z + (mz / mLen) * (e.speed * 0.82) * dt);
            e.walkCycle += dt * e.speed * 1.9;
          } else {
            e.patrolAngle += dt * 0.85;
            const tx = e.home.x + Math.cos(e.patrolAngle) * (e.patrolR * 0.45);
            const tz = e.home.z + Math.sin(e.patrolAngle) * (e.patrolR * 0.45);
            e.pos.x += (tx - e.pos.x) * Math.min(1, dt * 1.5);
            e.pos.z += (tz - e.pos.z) * Math.min(1, dt * 1.5);
            e.walkCycle += dt * 2.8;
          }

          if (e.cooldown <= 0) {
            e.cooldown = e.fireRate;
            audio.playBow();
            const muzzle = e.pos.clone().add(new THREE.Vector3(0, 1.0 + e.jumpY, 0));
            const leadTime = e.smartAi ? Math.min(0.45, horizDist / 16.0) : 0;
            const predicted = playerCenter.clone().add(new THREE.Vector3(player.vel.x * leadTime, 0, player.vel.z * leadTime));
            const aimDir = predicted.sub(muzzle).normalize();
            const shotSpd = e.smartAi ? 16.0 : 13.5;
            const arrow = new THREE.Mesh(
              new THREE.BoxGeometry(0.15, 0.15, 0.68),
              new THREE.MeshBasicMaterial({ color: e.isAiPlayer ? 0xfacc15 : 0xff4d6d })
            );
            arrow.position.copy(muzzle);
            arrow.lookAt(muzzle.clone().add(aimDir));
            this.root.add(arrow);
            this.projectiles.push({
              mesh: arrow, pos: muzzle, vel: aimDir.multiplyScalar(shotSpd),
              gravity: 0.45, fromPlayer: false, damage: 1, life: 2.4, color: 0xff4d6d, spin: false,
            });
          }
        }
      } else {
        e.patrolAngle += dt * 0.65;
        const tx = e.home.x + Math.cos(e.patrolAngle) * (e.patrolR * 0.65);
        const tz = e.home.z + Math.sin(e.patrolAngle) * (e.patrolR * 0.65);
        const dx = tx - e.pos.x;
        const dz = tz - e.pos.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.1) {
          e.yaw = Math.atan2(dx, dz);
          e.pos.x += (dx / dist) * (e.speed * 0.45) * dt;
          e.pos.z += (dz / dist) * (e.speed * 0.45) * dt;
          e.walkCycle += dt * 3.2;
        }
      }

      e.group.position.set(e.pos.x, e.baseY + e.jumpY, e.pos.z);
      e.group.rotation.y = e.yaw;
      const swing = Math.sin(e.walkCycle) * 0.48;
      e.legL.rotation.x = swing;
      e.legR.rotation.x = -swing;
      if (e.type === 'brawler') {
        if (e.attackAnim > 0) {
          e.attackAnim -= dt;
          e.armR.rotation.x = -1.75;
        } else {
          e.armR.rotation.x = swing * 0.7;
        }
      }
    }

    // 1b. Update AI Guildmate Allies (assist you in Sky Arena Guild Skirmishes!)
    for (const al of this.allies) {
      al.cooldown = Math.max(0, al.cooldown - dt);
      al.strafeTimer -= dt;
      if (al.strafeTimer <= 0) { al.strafeTimer = 1.4; al.strafeDir = -al.strafeDir; }

      let target = null;
      let bestD = Infinity;
      for (const e of this.enemies) {
        if (e.dead) continue;
        const d = al.pos.distanceTo(e.pos);
        if (d < bestD) { bestD = d; target = e; }
      }
      if (target) {
        const dx = target.pos.x - al.pos.x;
        const dz = target.pos.z - al.pos.z;
        const dist = Math.hypot(dx, dz) || 1;
        al.yaw = Math.atan2(dx, dz);
        const kite = dist < 7.5 ? -0.75 : (dist > 14 ? 0.6 : 0);
        const mx = (dx / dist) * kite + (-dz / dist) * al.strafeDir * 0.85;
        const mz = (dz / dist) * kite + (dx / dist) * al.strafeDir * 0.85;
        const ml = Math.hypot(mx, mz) || 1;
        al.pos.x = Math.max(-17, Math.min(17, al.pos.x + (mx / ml) * al.speed * dt));
        al.pos.z = Math.max(-17, Math.min(17, al.pos.z + (mz / ml) * al.speed * dt));
        al.walkCycle += dt * al.speed * 1.9;
        if (al.cooldown <= 0 && dist < 26) {
          al.cooldown = 1.05;
          const muzzle = al.pos.clone().add(new THREE.Vector3(0, 1.0, 0));
          const aim = target.pos.clone().add(new THREE.Vector3(0, 0.9, 0)).sub(muzzle).normalize();
          const bolt = new THREE.Mesh(
            new THREE.BoxGeometry(0.14, 0.14, 0.65),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
          );
          bolt.position.copy(muzzle);
          bolt.lookAt(muzzle.clone().add(aim));
          this.root.add(bolt);
          this.projectiles.push({
            mesh: bolt, pos: muzzle, vel: aim.multiplyScalar(22),
            gravity: 0.35, fromPlayer: true, damage: al.damage, life: 1.8, color: 0x38bdf8, spin: false,
          });
        }
      }
      al.group.position.copy(al.pos);
      al.group.rotation.y = al.yaw;
      const sw = Math.sin(al.walkCycle) * 0.48;
      al.legL.rotation.x = sw;
      al.legR.rotation.x = -sw;
    }

    // 2. Projectiles (checked against water ponds/fountain FIRST for splashes, then solid colliders & enemies!)
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (!p.prevPos) p.prevPos = p.pos.clone();
      else p.prevPos.copy(p.pos);
      p.life -= dt;
      p.vel.y -= p.gravity * dt;
      p.pos.addScaledVector(p.vel, dt);
      p.mesh.position.copy(p.pos);
      if (p.spin) {
        p.mesh.rotation.x += 8 * dt;
        p.mesh.rotation.y += 6 * dt;
      }

      let remove = p.life <= 0 || p.pos.y < -18;
      // Water Splash check FIRST so stones/knives/arrows hitting fountain or castle ponds ALWAYS splash!
      if (!remove && this.world?.waterZones?.length && this.world.spawnWaterSplash) {
        for (const wz of this.world.waterZones) {
          const inXZ = p.pos.x >= wz.minX && p.pos.x <= wz.maxX && p.pos.z >= wz.minZ && p.pos.z <= wz.maxZ;
          const crossedY = (p.prevPos.y >= wz.y - 0.15 && p.pos.y <= wz.y + 0.35) || (p.pos.y <= wz.y + 0.35 && p.pos.y >= wz.y - 0.65);
          if (inXZ && crossedY) {
            this.world.spawnWaterSplash(new THREE.Vector3(p.pos.x, wz.y, p.pos.z), p.fromPlayer ? 1.2 : 0.85);
            remove = true;
            break;
          }
        }
      }
      if (!remove) {
        for (const c of this.world.colliders) {
          if (p.pos.x > c.minX && p.pos.x < c.maxX && p.pos.y > c.minY && p.pos.y < c.maxY && p.pos.z > c.minZ && p.pos.z < c.maxZ) {
            this.world.spawnBurst(p.pos, p.color, 5, 2.5);
            remove = true;
            break;
          }
        }
      }

      if (!remove && p.fromPlayer) {
        for (const e of this.enemies) {
          if (e.dead) continue;
          const hitR = e.isBoss ? 1.25 : 0.9;
          if (p.pos.distanceTo(e.pos.clone().add(new THREE.Vector3(0, 0.9, 0))) < hitR) {
            this.damageEnemy(e, p.damage, new THREE.Vector3(p.vel.x, 0, p.vel.z).normalize());
            remove = true;
            break;
          }
        }
        if (!remove && this.dummy && p.pos.distanceTo(this.dummy.pos.clone().add(new THREE.Vector3(0, 1.0, 0))) < 0.95) {
          this.hitDummy(p.damage);
          remove = true;
        }
      } else if (!remove && !p.fromPlayer && player.hp > 0) {
        if (p.pos.distanceTo(playerCenter) < 0.75) {
          player.takeDamage(p.damage, new THREE.Vector3(p.vel.x, 0, p.vel.z).normalize());
          this.world.spawnBurst(p.pos, 0xff4d6d, 8, 3.5);
          remove = true;
        }
      }

      if (remove) {
        this.disposeObject(p.mesh);
        this.root.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }

    // 3. Spinning Golden Credit Coins (clamped safely on island + magnetic pull toward player!)
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      if (c.collected) continue;
      c.mesh.rotation.y += 5.5 * dt;
      c.vel.y -= 16 * dt;
      c.pos.addScaledVector(c.vel, dt);
      if (c.pos.y < c.groundY) {
        c.pos.y = c.groundY;
        c.vel.y = Math.abs(c.vel.y) * 0.32;
        c.vel.x *= 0.78;
        c.vel.z *= 0.78;
      }

      // Keep bounced coins from ever flying off the island edge
      const dxA = c.pos.x - c.anchor.x;
      const dzA = c.pos.z - c.anchor.z;
      const dA = Math.hypot(dxA, dzA);
      if (dA > c.maxR) {
        c.pos.x = c.anchor.x + (dxA / dA) * c.maxR;
        c.pos.z = c.anchor.z + (dzA / dA) * c.maxR;
        c.vel.x *= -0.4;
        c.vel.z *= -0.4;
      }

      // Magnet pull when close!
      const dist = c.pos.distanceTo(playerCenter);
      if (dist < 4.8) {
        const pull = playerCenter.clone().sub(c.pos).normalize();
        c.pos.addScaledVector(pull, 12 * dt);
      }
      c.mesh.position.copy(c.pos);

      if (dist < 1.15) {
        c.collected = true;
        this.disposeObject(c.mesh);
        this.root.remove(c.mesh);
        audio.playCoin();
        if (this.cb.onCoin) this.cb.onCoin(c.value);
        this.coins.splice(i, 1);
      }
    }

    // 4. Weapon Drops (NEVER auto-equip — stored cleanly into 15-Slot Character Bag!)
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      if (d.collected) continue;
      d.group.position.y = d.baseY + Math.sin(elapsed * 3.0) * 0.18;
      d.group.rotation.y = elapsed * 2.2;
      if (playerCenter.distanceTo(d.group.position) < 1.45) {
        const picked = this.cb.onWeaponLooted ? this.cb.onWeaponLooted(d.weaponId) : true;
        if (picked) {
          d.collected = true;
          this.disposeObject(d.group);
          this.root.remove(d.group);
          audio.playPickupWeapon();
          this.world.spawnBurst(d.group.position, 0x38bdf8, 16, 4.8);
          this.drops.splice(i, 1);
        }
      }
    }

    // 4.5 1UP Heart Stones (pick up to restore +1 Heart up to 3, or +1 Armor Shield if hearts are full!)
    for (let i = this.heartStones.length - 1; i >= 0; i--) {
      const hs = this.heartStones[i];
      if (hs.collected) continue;
      hs.heartGroup.rotation.y = elapsed * 2.6;
      const bob = Math.sin(elapsed * 3.4 + i) * 0.16;
      hs.heartGroup.position.y = bob;
      hs.halo.scale.setScalar(1 + Math.sin(elapsed * 5.0 + i) * 0.08);

      const needsHeart = player.hp > 0 && player.hp < player.maxHp;
      const needsShield = player.hp > 0 && player.hp >= player.maxHp && player.armorShield < player.maxArmorShield;
      const dist = playerCenter.distanceTo(hs.group.position);

      if ((needsHeart || needsShield) && dist < 3.4) {
        const pull = playerCenter.clone().sub(hs.group.position).normalize();
        hs.group.position.addScaledVector(pull, 8.5 * dt);
      }

      if ((needsHeart || needsShield) && dist < 1.5) {
        let used = false;
        if (needsHeart) {
          used = player.healHeart(1, '1UP HEART STONE! +1 ♥');
        } else if (needsShield) {
          used = player.healShield(1, '1UP HEART STONE! +1 ◆ SHIELD');
        }
        if (used) {
          hs.collected = true;
          this.disposeObject(hs.group);
          this.root.remove(hs.group);
          this.heartStones.splice(i, 1);
        }
      }
    }

    // 5. Slash VFX
    for (let i = this.slashEffects.length - 1; i >= 0; i--) {
      const s = this.slashEffects[i];
      s.life -= dt;
      if (s.life <= 0) {
        this.root.remove(s.mesh);
        s.mesh.geometry.dispose();
        s.mesh.material.dispose();
        this.slashEffects.splice(i, 1);
        continue;
      }
      const prog = 1 - s.life / s.maxLife;
      if (s.expand) s.mesh.scale.setScalar(1 + prog * s.maxScale);
      s.mesh.material.opacity = 1 - prog;
    }
  }
}
