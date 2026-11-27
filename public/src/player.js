import * as THREE from '../lib/three.module.min.js';
import { audio } from './audio.js';
import { WEAPON_CATALOG, AVATAR_OPTIONS, getGlowTier, getEquippedItem } from './state.js';
import { buildWeaponMesh } from './combat.js';
import { makeCharacterTextures } from './textures.js';

function makePixelFaceTexture(skinHex, hairHex, emotion, beard) {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 32;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Base skin + subtle Minecraft/Roblox cheek warmth, forehead highlight & jaw shading
  ctx.fillStyle = skinHex;
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(4, 2, 24, 5);
  ctx.fillStyle = 'rgba(0,0,0,0.11)';
  ctx.fillRect(0, 28, 32, 4);
  ctx.fillRect(0, 0, 2, 32); ctx.fillRect(30, 0, 2, 32);
  // Warm cheek blush & subtle nose bridge
  ctx.fillStyle = 'rgba(244,63,94,0.16)';
  ctx.fillRect(4, 18, 5, 3); ctx.fillRect(23, 18, 5, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.09)';
  ctx.fillRect(15, 16, 2, 4);

  if (emotion === 'cool') {
    // Crisp 32x32 Pixel Aviator Sunglasses with Cyan Sky Reflection
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(4, 10, 10, 7); ctx.fillRect(18, 10, 10, 7); ctx.fillRect(14, 12, 4, 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(6, 12, 4, 2); ctx.fillRect(20, 12, 4, 2);
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(6, 11, 2, 1); ctx.fillRect(20, 11, 2, 1);
    ctx.fillStyle = '#3b1f16';
    ctx.fillRect(12, 22, 8, 2); ctx.fillRect(20, 20, 2, 2);
  } else {
    // Crisp White Sclera + Deep Iris + Dual Specular Sparkles!
    if (emotion === 'wink') {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(6, 12, 6, 6);
      ctx.fillStyle = '#0f172a'; ctx.fillRect(8, 12, 4, 6);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(8, 13, 2, 2);
      ctx.fillStyle = '#0f172a'; ctx.fillRect(20, 15, 6, 2);
    } else {
      const ey = emotion === 'surprised' ? 10 : 12;
      ctx.fillStyle = '#ffffff'; ctx.fillRect(6, ey, 6, 6); ctx.fillRect(20, ey, 6, 6);
      ctx.fillStyle = '#0f172a'; ctx.fillRect(8, ey, 4, 6); ctx.fillRect(20, ey, 4, 6);
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(8, ey + 4, 4, 2); ctx.fillRect(20, ey + 4, 4, 2);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(8, ey + 1, 2, 2); ctx.fillRect(20, ey + 1, 2, 2);
    }

    // Expressive Eyebrows
    ctx.fillStyle = hairHex;
    if (emotion === 'determined') {
      ctx.fillRect(5, 9, 7, 2); ctx.fillRect(20, 9, 7, 2);
    } else if (emotion === 'fierce') {
      ctx.fillRect(5, 8, 4, 2); ctx.fillRect(9, 10, 4, 2);
      ctx.fillRect(23, 8, 4, 2); ctx.fillRect(19, 10, 4, 2);
    } else {
      ctx.fillRect(6, 9, 6, 2); ctx.fillRect(20, 9, 6, 2);
    }

    // Mouth
    ctx.fillStyle = '#5c1f24';
    if (emotion === 'happy' || emotion === 'wink') {
      ctx.fillRect(10, 22, 2, 2); ctx.fillRect(12, 24, 8, 2); ctx.fillRect(20, 22, 2, 2);
    } else if (emotion === 'surprised') {
      ctx.fillRect(14, 22, 4, 4);
    } else if (emotion === 'fierce') {
      ctx.fillRect(10, 24, 12, 2);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(12, 22, 8, 2);
    } else {
      ctx.fillRect(12, 23, 8, 2);
    }
  }

  // Facial Hair / Beard (32x32 crisp shading)
  ctx.fillStyle = hairHex;
  if (beard === 'stubble') {
    ctx.fillStyle = 'rgba(20, 20, 20, 0.30)';
    for (let x = 4; x < 28; x += 3) {
      ctx.fillRect(x, 26, 2, 2); ctx.fillRect(x + 1, 29, 2, 2);
    }
  } else if (beard === 'mustache') {
    ctx.fillRect(10, 20, 12, 2); ctx.fillRect(8, 22, 4, 2); ctx.fillRect(20, 22, 4, 2);
  } else if (beard === 'goatee') {
    ctx.fillRect(12, 26, 8, 6); ctx.fillRect(10, 20, 12, 2);
  } else if (beard === 'full') {
    ctx.fillRect(4, 22, 4, 10); ctx.fillRect(24, 22, 4, 10);
    ctx.fillRect(6, 26, 20, 6); ctx.fillRect(10, 20, 12, 2);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class VoxelPlayer {
  constructor(scene, saveState, callbacks) {
    this.scene = scene;
    this.saveState = saveState;
    this.world = null;
    this.cb = callbacks;

    this.radius = 0.36;
    this.height = 1.45;
    this.gravity = 28.0;
    this.jumpVel = 11.6;
    this.doubleJumpVel = 11.2;
    this.dashSpeed = 24.0;
    this.dashDuration = 0.25;

    // 3 Base Hearts + Armor Shield pips from Armor upgrades + 15s Auto Heart Regen
    this.maxHp = 3;
    this.hp = 3;
    this.armorShield = 0;
    this.maxArmorShield = 0;
    this.heartRegenInterval = 15.0;
    this.heartRegenTimer = 0;
    this._lastRegenSecShown = -1;

    this.invulnTimer = 0;
    this.bounceCooldown = 0;
    this.attackCooldown = 0;
    this.attackAnim = 0;

    this.spawnPos = new THREE.Vector3(0, 1.2, 5.5);
    this.pos = this.spawnPos.clone();
    this.vel = new THREE.Vector3();
    this.facingYaw = Math.PI;
    this.onGround = false;
    this.standingPlatform = null;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.canDoubleJump = false;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.dashDir = new THREE.Vector3(0, 0, -1);
    this.lastMoveVec = new THREE.Vector3(0, 0, 0);
    this.airDashReady = true;
    this.walkCycle = 0;

    this.camYaw = 0;
    this.camPitch = 0.4;
    this.portalCooldown = 0;
    this.shopCooldown = 0;
    this.saveCooldown = 0;

    this.buildMesh();
    this.buildOverheadHpBar();
    this.buildShadowBlob();
    this.refreshGearVisuals();
    this.updateOverheadHpBar();
  }

  get moveSpeed() {
    const base = 8.0 + (this.saveState.stats.spd - 1) * 0.72;
    const guildSpd = this.saveState.guild?.bonusType === 'spd' ? (1 + (this.saveState.guild.bonusVal || 0.10)) : 1;
    return base * guildSpd;
  }

  getNearbyNpc() {
    if (!this.world?.friendlyNpcs?.length) return null;
    const center = this.pos.clone().add(new THREE.Vector3(0, 0.8, 0));
    let best = null;
    let bestD = 4.2;
    for (const npc of this.world.friendlyNpcs) {
      const d = center.distanceTo(npc.pos);
      if (d < bestD) { bestD = d; best = npc; }
    }
    return best;
  }

  get dashCooldownMax() {
    return Math.max(0.28, 0.72 - (this.saveState.stats.sta - 1) * 0.08);
  }

  buildMesh() {
    this.group = new THREE.Group();

    this.mSkin = new THREE.MeshLambertMaterial({ color: 0xffd1a9 });
    this.mFace = new THREE.MeshLambertMaterial({ color: 0xffffff });
    this.mTunic = new THREE.MeshLambertMaterial({ color: 0xffffff });
    this.mSleeve = new THREE.MeshLambertMaterial({ color: 0xffffff });
    this.mCape = new THREE.MeshLambertMaterial({ color: 0xffffff });
    this.mBoots = new THREE.MeshLambertMaterial({ color: 0xffffff });

    // Hip-pivoted Legs with 32x32 textured trousers & laced adventurer boots!
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.14, 0.49, 0);
    const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.48, 0.24), this.mBoots);
    leftLegMesh.position.y = -0.24;
    this.leftLeg.add(leftLegMesh);

    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.14, 0.49, 0);
    const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.48, 0.24), this.mBoots);
    rightLegMesh.position.y = -0.24;
    this.rightLeg.add(rightLegMesh);

    this.torso = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.56, 0.34), this.mTunic);
    this.torso.position.set(0, 0.72, 0);

    this.cape = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.56, 0.08), this.mCape);
    this.cape.position.set(0, 0.72, -0.22);

    // Articulated Left & Right Arms with Textured Bracer Sleeves + Skin-Toned Hands!
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.37, 0.88, 0);
    const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.18), this.mSleeve);
    leftArmMesh.position.y = -0.14;
    const leftHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.16), this.mSkin);
    leftHandMesh.position.y = -0.36;
    this.leftArm.add(leftArmMesh, leftHandMesh);

    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.37, 0.88, 0);
    const armMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.18), this.mSleeve);
    armMesh.position.y = -0.14;
    const rightHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.16), this.mSkin);
    rightHandMesh.position.y = -0.36;
    this.rightArm.add(armMesh, rightHandMesh);

    this.heldWeaponSlot = new THREE.Group();
    this.heldWeaponSlot.position.set(0, -0.34, 0.2);
    this.rightArm.add(this.heldWeaponSlot);

    this.head = new THREE.Group();
    this.head.position.set(0, 1.22, 0);
    // +z face uses dynamic pixel emotion/beard texture!
    const skullMats = [this.mSkin, this.mSkin, this.mSkin, this.mSkin, this.mFace, this.mSkin];
    this.skull = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.44, 0.44), skullMats);
    this.hairSlot = new THREE.Group();
    this.head.add(this.skull, this.hairSlot);

    // Visible Upgradeable Armor Group (Chestplate, Pauldrons, Crest, Aura Ring!)
    this.armorSlot = new THREE.Group();
    this.auraRing = null;

    this.group.add(this.leftLeg, this.rightLeg, this.torso, this.cape, this.leftArm, this.rightArm, this.head, this.armorSlot);
    this.group.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    this.scene.add(this.group);
  }

  refreshAvatarVisuals() {
    const av = this.saveState.avatar || {};
    const skinObj = AVATAR_OPTIONS.skin.find((s) => s.id === av.skin) || AVATAR_OPTIONS.skin[0];
    const hairColObj = AVATAR_OPTIONS.hairColor.find((h) => h.id === av.hairColor) || AVATAR_OPTIONS.hairColor[0];
    const outfitObj = AVATAR_OPTIONS.outfit.find((o) => o.id === av.outfit) || AVATAR_OPTIONS.outfit[0];

    this.mSkin.color.set(skinObj.hex);
    const cTex = makeCharacterTextures(outfitObj.tunic, outfitObj.cape, outfitObj.boots);
    this.mTunic.color.setHex(0xffffff); this.mTunic.map = cTex.tunicTex; this.mTunic.needsUpdate = true;
    this.mSleeve.color.setHex(0xffffff); this.mSleeve.map = cTex.sleeveTex; this.mSleeve.needsUpdate = true;
    this.mCape.color.setHex(0xffffff); this.mCape.map = cTex.capeTex; this.mCape.needsUpdate = true;
    this.mBoots.color.setHex(0xffffff); this.mBoots.map = cTex.bootTex; this.mBoots.needsUpdate = true;

    // Update live 32x32 HD pixel face (emotion + beard)
    if (this.mFace.map) this.mFace.map.dispose();
    this.mFace.map = makePixelFaceTexture(skinObj.hex, hairColObj.hex, av.emotion || 'happy', av.beard || 'none');
    this.mFace.needsUpdate = true;

    // Rebuild 3D Hair / Hat / 3D Beard Volume
    while (this.hairSlot.children.length > 0) {
      const c = this.hairSlot.children.pop();
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
    }

    const mHair = new THREE.MeshLambertMaterial({ color: hairColObj.hex });
    const style = av.hairStyle || 'hat';
    if (style === 'hat') {
      const mHat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
      const brim = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.09, 0.64), mHat);
      brim.position.y = 0.22;
      const crown = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.2, 0.46), mHat);
      crown.position.y = 0.35;
      const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.16, 0.26), mHair);
      hairBack.position.set(0, 0.1, -0.14);
      this.hairSlot.add(brim, crown, hairBack);
    } else if (style === 'short') {
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.16, 0.48), mHair);
      cap.position.y = 0.22;
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.26, 0.18), mHair);
      back.position.set(0, 0.08, -0.18);
      this.hairSlot.add(cap, back);
    } else if (style === 'spiky') {
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.14, 0.48), mHair);
      base.position.y = 0.22;
      this.hairSlot.add(base);
      for (const [sx, sz, h] of [[-0.14, 0.08, 0.22], [0.14, 0.08, 0.22], [0, -0.04, 0.28], [-0.12, -0.14, 0.2], [0.12, -0.14, 0.2]]) {
        const sp = new THREE.Mesh(new THREE.BoxGeometry(0.13, h, 0.13), mHair);
        sp.position.set(sx, 0.28 + h * 0.4, sz);
        this.hairSlot.add(sp);
      }
    } else if (style === 'long') {
      const top = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.16, 0.50), mHair);
      top.position.y = 0.22;
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.58, 0.18), mHair);
      back.position.set(0, -0.06, -0.2);
      const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.26), mHair);
      sideL.position.set(-0.24, 0.0, -0.06);
      const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.26), mHair);
      sideR.position.set(0.24, 0.0, -0.06);
      this.hairSlot.add(top, back, sideL, sideR);
    } else if (style === 'mohawk') {
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.26, 0.52), mHair);
      ridge.position.set(0, 0.33, -0.02);
      this.hairSlot.add(ridge);
    }

    // Extra 3D voxel chin beard for full beard / goatee
    if (av.beard === 'full') {
      const b3d = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.14, 0.1), mHair);
      b3d.position.set(0, -0.18, 0.23);
      this.hairSlot.add(b3d);
    } else if (av.beard === 'goatee') {
      const g3d = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.08), mHair);
      g3d.position.set(0, -0.19, 0.23);
      this.hairSlot.add(g3d);
    }
  }

  refreshGearVisuals() {
    this.refreshAvatarVisuals();
    // 1. Rebuild Held Weapon with its exact Upgrade Glow Tier
    while (this.heldWeaponSlot.children.length > 0) {
      const c = this.heldWeaponSlot.children.pop();
      c.traverse?.((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    }
    const eqItem = getEquippedItem(this.saveState);
    this.heldWeaponMesh = buildWeaponMesh(eqItem.weaponId, eqItem.level || 1);
    this.heldWeaponSlot.add(this.heldWeaponMesh);

    // 2. Rebuild Visible 3D Armor Plates + Distinct Per-Level Glow!
    while (this.armorSlot.children.length > 0) {
      const c = this.armorSlot.children.pop();
      c.traverse?.((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    }
    this.auraRing = null;

    const aLvl = this.saveState.armorLevel || 1;
    const glow = getGlowTier(aLvl);
    this.maxArmorShield = Math.min(3, Math.floor(aLvl / 2));
    this.armorPlateMat = null;

    if (aLvl >= 2) {
      const plateMat = new THREE.MeshLambertMaterial({
        color: glow.color,
        emissive: glow.emissive,
        emissiveIntensity: glow.intensity,
      });
      this.armorPlateMat = plateMat;

      // Layered Graphic-Artist Chestplate Relief + Gold Trim
      const chest = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.46, 0.40), plateMat);
      chest.position.set(0, 0.74, 0);
      const chestPlateFront = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.30, 0.06), plateMat);
      chestPlateFront.position.set(0, 0.76, 0.21);
      const trimMat = new THREE.MeshLambertMaterial({ color: 0xfacc15, emissive: glow.emissive, emissiveIntensity: glow.intensity * 0.5 });
      const emblem = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.08), trimMat);
      emblem.position.set(0, 0.78, 0.23);
      this.armorSlot.add(chest, chestPlateFront, emblem);

      // Sculpted Double-Tier Shoulder Pauldrons with Rivets
      const pL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.38), plateMat);
      pL.position.set(-0.41, 0.96, 0);
      const pLTop = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.08, 0.30), trimMat);
      pLTop.position.set(-0.42, 1.09, 0);
      const pR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.38), plateMat);
      pR.position.set(0.41, 0.96, 0);
      const pRTop = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.08, 0.30), trimMat);
      pRTop.position.set(0.42, 1.09, 0);
      this.armorSlot.add(pL, pLTop, pR, pRTop);

      // Lv 3+: Glowing Waist Belt, Gold Buckle & Knee Greaves
      if (aLvl >= 3) {
        const belt = new THREE.Mesh(new THREE.BoxGeometry(0.63, 0.12, 0.43), plateMat);
        belt.position.set(0, 0.48, 0);
        const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.08), trimMat);
        buckle.position.set(0, 0.48, 0.22);
        this.armorSlot.add(belt, buckle);
      }

      // Lv 4+: Gilded Winged Helmet Crest
      if (aLvl >= 4) {
        const crest = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, 0.50), plateMat);
        crest.position.set(0, 1.72, 0);
        const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.10), trimMat);
        wingL.position.set(-0.28, 1.56, 0);
        wingL.rotation.z = 0.45;
        const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.10), trimMat);
        wingR.position.set(0.28, 1.56, 0);
        wingR.rotation.z = -0.45;
        this.armorSlot.add(crest, wingL, wingR);
      }

      // Lv 5+: Orbiting/Ground Glowing Aura Ring around character feet (cleanly above all floor inlays!)
      if (aLvl >= 5) {
        this.auraRing = new THREE.Mesh(
          new THREE.RingGeometry(0.55, 0.74, 16),
          new THREE.MeshBasicMaterial({
            color: glow.color, side: THREE.DoubleSide, transparent: true, opacity: 0.75,
            depthWrite: false, polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -5,
          })
        );
        this.auraRing.rotation.x = -Math.PI / 2;
        this.auraRing.position.y = 0.022;
        this.auraRing.renderOrder = 2;
        this.armorSlot.add(this.auraRing);
      }
    }
    this.updateOverheadHpBar();
    if (this.cb.onGearChange) this.cb.onGearChange(this);
  }

  setWorld(world, spawnArr, resetHp = true) {
    this.world = world;
    this.spawnPos.set(spawnArr[0], spawnArr[1], spawnArr[2]);
    this.pos.copy(this.spawnPos);
    this.vel.set(0, 0, 0);
    this.facingYaw = Math.PI;
    this.camYaw = 0;
    this.camPitch = 0.22;
    this.onGround = false;
    this.standingPlatform = null;
    this.dashTimer = 0;
    this.invulnTimer = 0.5;
    this.portalCooldown = 1.2;
    this.shopCooldown = 1.0;
    this.saveCooldown = 1.0;
    this.relicWarnCooldown = 0;
    this.group.visible = true;
    this.group.position.copy(this.pos);
    this.group.rotation.y = this.facingYaw;
    this.refreshGearVisuals();
    this.updateShadowBlob();
    if (resetHp) {
      this.hp = this.maxHp;
      this.armorShield = this.maxArmorShield;
      this.heartRegenTimer = 0;
      this._lastRegenSecShown = -1;
      if (this.cb.onHpChange) this.cb.onHpChange(this.hp, this.maxHp, this.armorShield, 0);
    }
    this.updateOverheadHpBar();
  }

  healFull() {
    this.hp = this.maxHp;
    this.armorShield = this.maxArmorShield;
    this.heartRegenTimer = 0;
    this._lastRegenSecShown = -1;
    this.updateOverheadHpBar();
    if (this.cb.onHpChange) this.cb.onHpChange(this.hp, this.maxHp, this.armorShield, 0);
  }

  healHeart(amount = 1, toastMsg = null) {
    if (this.hp <= 0 || this.hp >= this.maxHp) return false;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    if (this.hp >= this.maxHp) {
      this.heartRegenTimer = 0;
      this._lastRegenSecShown = -1;
    }
    audio.playHeartPickup();
    if (this.world) this.world.spawnBurst(this.pos.clone().add(new THREE.Vector3(0, 1.0, 0)), 0xfb7185, 16, 4.8);
    const nextSecs = this.hp < this.maxHp ? Math.ceil(this.heartRegenInterval - this.heartRegenTimer) : 0;
    this.updateOverheadHpBar();
    if (this.cb.onHpChange) this.cb.onHpChange(this.hp, this.maxHp, this.armorShield, nextSecs);
    if (toastMsg && this.cb.onHealToast) this.cb.onHealToast(toastMsg);
    return true;
  }

  healShield(amount = 1, toastMsg = null) {
    if (this.hp <= 0 || this.armorShield >= this.maxArmorShield) return false;
    this.armorShield = Math.min(this.maxArmorShield, this.armorShield + amount);
    audio.playHeartPickup();
    if (this.world) this.world.spawnBurst(this.pos.clone().add(new THREE.Vector3(0, 1.0, 0)), 0x38bdf8, 14, 4.5);
    const nextSecs = this.hp < this.maxHp ? Math.ceil(this.heartRegenInterval - this.heartRegenTimer) : 0;
    this.updateOverheadHpBar();
    if (this.cb.onHpChange) this.cb.onHpChange(this.hp, this.maxHp, this.armorShield, nextSecs);
    if (toastMsg && this.cb.onHealToast) this.cb.onHealToast(toastMsg);
    return true;
  }

  buildOverheadHpBar() {
    this.hpCanvas = document.createElement('canvas');
    this.hpCanvas.width = 160;
    this.hpCanvas.height = 42;
    this.hpCtx = this.hpCanvas.getContext('2d');
    this.hpTex = new THREE.CanvasTexture(this.hpCanvas);
    this.hpTex.magFilter = THREE.NearestFilter;
    this.hpTex.minFilter = THREE.NearestFilter;
    this.hpSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.hpTex, transparent: true, depthTest: false })
    );
    this.hpSprite.scale.set(1.85, 0.48, 1);
    this.hpSprite.position.set(0, 2.08, 0);
    this.hpSprite.renderOrder = 20;
    this.group.add(this.hpSprite);
  }

  updateOverheadHpBar() {
    if (!this.hpCtx || !this.hpTex) return;
    const ctx = this.hpCtx;
    const W = 160, H = 42;
    ctx.clearRect(0, 0, W, H);

    const pct = Math.max(0, Math.min(1, this.hp / Math.max(1, this.maxHp)));
    // Dark pixel frame
    ctx.fillStyle = 'rgba(2, 6, 23, 0.86)';
    ctx.fillRect(4, 4, W - 8, H - 8);
    ctx.strokeStyle = this.armorShield > 0 ? '#38bdf8' : '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, W - 10, H - 10);

    // Health bar track + dynamic color fill (green -> amber -> red)
    const barX = 10, barY = 21, barW = W - 20, barH = 11;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(barX, barY, barW, barH);
    const barCol = pct > 0.65 ? '#22c55e' : pct > 0.34 ? '#facc15' : '#ef4444';
    ctx.fillStyle = barCol;
    ctx.fillRect(barX, barY, Math.round(barW * pct), barH);

    // Crisp hearts & shield pips along top row
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let label = '';
    for (let i = 0; i < this.maxHp; i++) label += i < this.hp ? '♥' : '♡';
    if (this.armorShield > 0) {
      label += ' ';
      for (let i = 0; i < this.armorShield; i++) label += '◆';
    }
    ctx.fillStyle = '#fb7185';
    ctx.fillText(label, W * 0.5, 13);

    // HP numeric ratio centered on bar
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`HP ${this.hp}/${this.maxHp}`, W * 0.5, barY + barH * 0.5 + 0.5);

    this.hpTex.needsUpdate = true;
  }

  buildShadowBlob() {
    const geo = new THREE.CircleGeometry(0.46, 12);
    geo.rotateX(-Math.PI / 2);
    this.shadowBlob = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        color: 0x000000, transparent: true, opacity: 0.42, depthWrite: false,
        polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
      })
    );
    this.shadowBlob.renderOrder = 1;
    this.scene.add(this.shadowBlob);
  }

  requestJump() { this.jumpBufferTimer = 0.14; }

  requestAttack(combat) {
    if (this.hp <= 0 || this.attackCooldown > 0) return;
    const eq = getEquippedItem(this.saveState);
    const def = WEAPON_CATALOG[eq.weaponId] || WEAPON_CATALOG.stone;
    this.attackCooldown = def.cooldown;
    this.attackAnim = 0.22;
    combat.playerAttack(this);
    if (this.cb.onAttack) this.cb.onAttack(this);
  }

  requestDash(moveX = null, moveY = null) {
    if (!this.saveState.abilities.dash || this.dashTimer > 0 || this.dashCooldown > 0 || !this.airDashReady) return;
    this.dashTimer = this.dashDuration;
    this.dashCooldown = this.dashCooldownMax;
    if (!this.onGround) this.airDashReady = false;

    // 360° Directional Dash relative to camera & current movement input (left, right, back, diagonals, forward!)
    const fwd = new THREE.Vector3(-Math.sin(this.camYaw), 0, -Math.cos(this.camYaw));
    const right = new THREE.Vector3(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw));
    const dir = new THREE.Vector3();
    if (typeof moveX === 'number' && typeof moveY === 'number' && (Math.abs(moveX) > 0.05 || Math.abs(moveY) > 0.05)) {
      dir.addScaledVector(fwd, moveY).addScaledVector(right, moveX);
    } else if (this.lastMoveVec && this.lastMoveVec.lengthSq() > 0.01) {
      dir.copy(this.lastMoveVec);
    } else {
      dir.copy(fwd);
    }
    this.dashDir.copy(dir.normalize());
    this.facingYaw = Math.atan2(this.dashDir.x, this.dashDir.z);
    this.vel.y = 0.7;
    audio.playDash();
    this.world.spawnBurst(this.pos.clone().add(new THREE.Vector3(0, 0.6, 0)), 0xf97316, 16, 6.0);
  }

  takeDamage(amount, knockDir = null) {
    if (this.saveState.godMode || this.invulnTimer > 0 || this.hp <= 0) return;
    this.invulnTimer = 1.0;

    if (this.armorShield > 0) {
      this.armorShield = Math.max(0, this.armorShield - amount);
      audio.playEnemyHit();
      this.world.spawnBurst(this.pos.clone().add(new THREE.Vector3(0, 0.9, 0)), 0x38bdf8, 12, 4.2);
    } else {
      this.hp = Math.max(0, this.hp - amount);
      this.heartRegenTimer = 0;
      this._lastRegenSecShown = -1;
      audio.playPlayerHurt();
      this.world.spawnBurst(this.pos.clone().add(new THREE.Vector3(0, 0.85, 0)), 0xf43f5e, 14, 4.5);
    }

    if (knockDir) {
      this.vel.x = knockDir.x * 7.2;
      this.vel.z = knockDir.z * 7.2;
      this.vel.y = Math.max(this.vel.y, 5.2);
    }
    this.updateOverheadHpBar();
    const regenSecs = (this.hp > 0 && this.hp < this.maxHp) ? Math.ceil(this.heartRegenInterval - this.heartRegenTimer) : 0;
    if (this.cb.onHpChange) this.cb.onHpChange(this.hp, this.maxHp, this.armorShield, regenSecs);
    if (this.hp <= 0) {
      audio.playGameOver();
      if (this.cb.onGameOver) this.cb.onGameOver();
    }
  }

  respawn(costLife = false) {
    if (costLife && this.saveState.currentWorld !== 'haven') {
      this.hp = Math.max(0, this.hp - 1);
      this.heartRegenTimer = 0;
      this._lastRegenSecShown = -1;
      this.updateOverheadHpBar();
      const regenSecs = (this.hp > 0 && this.hp < this.maxHp) ? Math.ceil(this.heartRegenInterval - this.heartRegenTimer) : 0;
      if (this.cb.onHpChange) this.cb.onHpChange(this.hp, this.maxHp, this.armorShield, regenSecs);
      if (this.hp <= 0) {
        audio.playGameOver();
        if (this.cb.onGameOver) this.cb.onGameOver();
        return;
      }
    }
    audio.playFall();
    this.pos.copy(this.spawnPos);
    this.vel.set(0, 0, 0);
    this.dashTimer = 0;
    this.onGround = false;
    this.invulnTimer = 0.85;
    this.world.spawnBurst(this.pos.clone(), 0x67e8f9, 14, 4.0);
  }

  update(dt, elapsed, input) {
    if (this.hp <= 0) return;

    if (input.rotLeft) this.camYaw += 2.2 * dt;
    if (input.rotRight) this.camYaw -= 2.2 * dt;

    if (this.onGround && this.standingPlatform) this.pos.add(this.standingPlatform.delta);

    if (this.onGround) {
      this.coyoteTimer = 0.13;
      this.canDoubleJump = !!this.saveState.abilities.doubleJump;
      this.airDashReady = true;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }
    this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.attackAnim = Math.max(0, this.attackAnim - dt);
    this.portalCooldown = Math.max(0, this.portalCooldown - dt);
    this.shopCooldown = Math.max(0, this.shopCooldown - dt);
    this.saveCooldown = Math.max(0, this.saveCooldown - dt);
    this.relicWarnCooldown = Math.max(0, (this.relicWarnCooldown || 0) - dt);
    this.bounceCooldown = Math.max(0, (this.bounceCooldown || 0) - dt);

    // Automatic Heart Regeneration (toggleable in OPTION -> GAME SETTINGS): restores +1 Heart every 15 seconds up to 3 hearts!
    const autoRegenOn = this.saveState.autoHeartRegen !== false;
    if (autoRegenOn && this.hp > 0 && this.hp < this.maxHp) {
      this.heartRegenTimer += dt;
      if (this.heartRegenTimer >= this.heartRegenInterval) {
        this.heartRegenTimer = 0;
        this._lastRegenSecShown = -1;
        this.healHeart(1, '+1 ♥ HEART REGENERATED!');
      } else {
        const secsLeft = Math.ceil(this.heartRegenInterval - this.heartRegenTimer);
        if (secsLeft !== this._lastRegenSecShown) {
          this._lastRegenSecShown = secsLeft;
          if (this.cb.onHpChange) this.cb.onHpChange(this.hp, this.maxHp, this.armorShield, secsLeft);
        }
      }
    } else if (this.heartRegenTimer > 0 || this._lastRegenSecShown !== -1) {
      this.heartRegenTimer = 0;
      this._lastRegenSecShown = -1;
      if (this.cb.onHpChange) this.cb.onHpChange(this.hp, this.maxHp, this.armorShield, 0);
    }

    if (this.invulnTimer > 0) {
      this.invulnTimer = Math.max(0, this.invulnTimer - dt);
      this.group.visible = Math.floor(this.invulnTimer * 18) % 2 === 0;
    } else {
      this.group.visible = true;
    }

    // Pulse Mythic Lv 6 glow aura on armor & weapon
    if (this.auraRing) {
      this.auraRing.rotation.z = elapsed * 2.5;
      this.auraRing.scale.setScalar(1 + Math.sin(elapsed * 5) * 0.08);
    }
    const pulseWave = 0.85 + Math.sin(elapsed * 5.2) * 0.45;
    if (this.armorPlateMat && (this.saveState.armorLevel || 1) >= 6) {
      this.armorPlateMat.emissiveIntensity = pulseWave;
    }
    const eqItem = getEquippedItem(this.saveState);
    const eqLvl = eqItem.level || 1;
    if (eqLvl >= 6 && this.heldWeaponMesh?.userData?.glowMaterials) {
      for (const gm of this.heldWeaponMesh.userData.glowMaterials) {
        gm.emissiveIntensity = pulseWave;
      }
    }

    const fwd = new THREE.Vector3(-Math.sin(this.camYaw), 0, -Math.cos(this.camYaw));
    const right = new THREE.Vector3(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw));
    const moveVec = new THREE.Vector3().addScaledVector(fwd, input.moveY).addScaledVector(right, input.moveX);
    const movingLen = moveVec.length();
    if (movingLen > 1) moveVec.divideScalar(movingLen);
    this.lastMoveVec.copy(moveVec);

    if (this.dashTimer > 0) {
      this.dashTimer -= dt;
      this.vel.x = this.dashDir.x * this.dashSpeed;
      this.vel.z = this.dashDir.z * this.dashSpeed;
      this.vel.y = 0;
    } else {
      const accel = this.onGround ? 18 : 11;
      this.vel.x += (moveVec.x * this.moveSpeed - this.vel.x) * Math.min(1, accel * dt);
      this.vel.z += (moveVec.z * this.moveSpeed - this.vel.z) * Math.min(1, accel * dt);

      if (movingLen > 0.08) {
        const desiredYaw = Math.atan2(moveVec.x, moveVec.z);
        let diff = desiredYaw - this.facingYaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.facingYaw += diff * Math.min(1, 14 * dt);
      }
      this.vel.y = Math.max(-28, this.vel.y - this.gravity * dt);
    }

    if (this.jumpBufferTimer > 0) {
      if (this.coyoteTimer > 0) {
        this.vel.y = this.jumpVel;
        this.onGround = false;
        this.standingPlatform = null;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        audio.playJump();
        this.world.spawnBurst(this.pos.clone(), 0xe2e8f0, 7, 2.8);
      } else if (this.canDoubleJump) {
        this.vel.y = this.doubleJumpVel;
        this.canDoubleJump = false;
        this.jumpBufferTimer = 0;
        this.dashTimer = 0;
        audio.playDoubleJump();
        this.world.spawnBurst(this.pos.clone(), 0x38bdf8, 12, 4.2);
      }
    }

    const wasOnGround = this.onGround;
    this.onGround = false;
    this.standingPlatform = null;

    this.checkBouncePads();
    // Anti-Tunneling Sub-Stepped Swept Physics (prevents ever clipping through platforms, walls, logs, diamonds, or stores!)
    const maxDisp = Math.max(Math.abs(this.vel.x * dt), Math.abs(this.vel.y * dt), Math.abs(this.vel.z * dt));
    const subSteps = Math.max(1, Math.min(8, Math.ceil(maxDisp / 0.18)));
    const subDt = dt / subSteps;
    for (let s = 0; s < subSteps; s++) {
      this.pos.x += this.vel.x * subDt; this.resolveHorizontal('x');
      this.pos.z += this.vel.z * subDt; this.resolveHorizontal('z');
      const prevY = this.pos.y;
      this.pos.y += this.vel.y * subDt; this.resolveVertical(wasOnGround || this.onGround, prevY);
      this.checkBouncePads();
    }
    this.resolvePenetrations();
    this.checkBouncePads();

    if (this.pos.y < -15) this.respawn(true);

    this.checkHazards();
    this.checkInteractions();

    this.group.position.copy(this.pos);
    this.group.rotation.y = this.facingYaw;

    const horizSpeed = Math.hypot(this.vel.x, this.vel.z);
    if (this.onGround && horizSpeed > 0.5) {
      this.walkCycle += dt * horizSpeed * 1.65;
      const swing = Math.sin(this.walkCycle) * 0.62;
      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;
      this.leftArm.rotation.x = -swing * 0.8;
      this.rightArm.rotation.x = swing * 0.65;
      this.cape.rotation.x = 0.25 + Math.abs(swing) * 0.25;
    } else if (!this.onGround) {
      this.leftLeg.rotation.x = 0.35; this.rightLeg.rotation.x = -0.25;
      this.leftArm.rotation.x = -0.65; this.rightArm.rotation.x = -0.65;
      this.cape.rotation.x = this.dashTimer > 0 ? 1.05 : 0.55;
    } else {
      this.leftLeg.rotation.x *= 0.8; this.rightLeg.rotation.x *= 0.8;
      this.leftArm.rotation.x *= 0.8; this.rightArm.rotation.x *= 0.8;
      this.cape.rotation.x = 0.1;
    }

    const eqDef = WEAPON_CATALOG[getEquippedItem(this.saveState).weaponId] || WEAPON_CATALOG.stone;
    if (this.attackAnim > 0) {
      this.rightArm.rotation.x = -1.75;
    } else if (eqDef.model === 'bow' || eqDef.model === 'spear') {
      this.rightArm.rotation.x = -1.15;
    }

    this.updateShadowBlob();
  }

  resolveHorizontal(axis) {
    const r = this.radius;
    const minY = this.pos.y + 0.08;
    const maxY = this.pos.y + this.height;
    const eps = 0.0006;
    for (const c of this.world.colliders) {
      if (c.disabled || c.isBounce) continue;
      if (maxY <= c.minY || minY >= c.maxY) continue;
      if (this.pos.x + r > c.minX && this.pos.x - r < c.maxX && this.pos.z + r > c.minZ && this.pos.z - r < c.maxZ) {
        if (axis === 'x') {
          if (this.vel.x > 0) this.pos.x = c.minX - r - eps;
          else if (this.vel.x < 0) this.pos.x = c.maxX + r + eps;
          else {
            const penL = (this.pos.x + r) - c.minX;
            const penR = c.maxX - (this.pos.x - r);
            this.pos.x = penL <= penR ? (c.minX - r - eps) : (c.maxX + r + eps);
          }
          this.vel.x = 0;
        } else {
          if (this.vel.z > 0) this.pos.z = c.minZ - r - eps;
          else if (this.vel.z < 0) this.pos.z = c.maxZ + r + eps;
          else {
            const penF = (this.pos.z + r) - c.minZ;
            const penB = c.maxZ - (this.pos.z - r);
            this.pos.z = penF <= penB ? (c.minZ - r - eps) : (c.maxZ + r + eps);
          }
          this.vel.z = 0;
        }
      }
    }
  }

  // Final MTV depenetration pass so dynamic moving blocks (like the Spiked Crusher Ram) or corner grazes NEVER let players clip inside solid geometry!
  resolvePenetrations() {
    const r = this.radius;
    const minY = this.pos.y + 0.12;
    const maxY = this.pos.y + this.height;
    const eps = 0.0006;
    for (let pass = 0; pass < 2; pass++) {
      let pushed = false;
      for (const c of this.world.colliders) {
        if (c.disabled || c.isBounce) continue;
        if (maxY <= c.minY || minY >= c.maxY) continue;
        if (this.pos.x + r > c.minX && this.pos.x - r < c.maxX && this.pos.z + r > c.minZ && this.pos.z - r < c.maxZ) {
          const penMinX = (this.pos.x + r) - c.minX;
          const penMaxX = c.maxX - (this.pos.x - r);
          const penMinZ = (this.pos.z + r) - c.minZ;
          const penMaxZ = c.maxZ - (this.pos.z - r);
          const minPen = Math.min(penMinX, penMaxX, penMinZ, penMaxZ);
          if (minPen === penMinX) { this.pos.x = c.minX - r - eps; if (this.vel.x > 0) this.vel.x = 0; }
          else if (minPen === penMaxX) { this.pos.x = c.maxX + r + eps; if (this.vel.x < 0) this.vel.x = 0; }
          else if (minPen === penMinZ) { this.pos.z = c.minZ - r - eps; if (this.vel.z > 0) this.vel.z = 0; }
          else { this.pos.z = c.maxZ + r + eps; if (this.vel.z < 0) this.vel.z = 0; }
          pushed = true;
        }
      }
      if (!pushed) break;
    }
  }

  // Instant Tornado Wind-Vortex Updraft Launch (works when walking, hopping, jumping, double-jumping, or dashing into ANY Tornado Jump Pad!)
  checkBouncePads() {
    if (this.bounceCooldown > 0 || !this.world) return;
    const r = this.radius;
    const launchHero = (minLiftY, boostVel) => {
      this.pos.y = Math.max(this.pos.y, minLiftY);
      this.vel.y = Math.max(this.vel.y, boostVel || 21.0);
      this.dashTimer = 0; // Cancel horizontal dash lock so vertical updraft launch ALWAYS fires!
      this.onGround = false;
      this.standingPlatform = null;
      this.coyoteTimer = 0;
      this.canDoubleJump = !!this.saveState.abilities.doubleJump;
      this.airDashReady = true;
      this.bounceCooldown = 0.24;
      audio.playBounce();
      this.world.spawnBurst(this.pos.clone().add(new THREE.Vector3(0, 0.35, 0)), 0x38bdf8, 20, 6.2);
    };

    // 1. Exact 2.0x2.0 Pad-Matched Tornado Wind-Vortex Column (same launch position, arc & boost as the cyan jump pad!)
    for (const jp of this.world.jumpPads || []) {
      const hw = jp.halfW || 1.06;
      const hd = jp.halfD || 1.06;
      if (
        Math.abs(this.pos.x - jp.x) <= hw + r * 0.85 &&
        Math.abs(this.pos.z - jp.z) <= hd + r * 0.85 &&
        this.pos.y >= jp.y - 0.35 &&
        this.pos.y <= jp.y + (jp.height || 2.45)
      ) {
        launchHero(jp.y + 0.30, jp.bounceVel || 17.8);
        return;
      }
    }

    // 2. Collider-based fallback for any bounce pad collider
    for (const c of this.world.colliders) {
      if (c.disabled || !c.isBounce) continue;
      if (
        this.pos.x + r * 0.85 > c.minX &&
        this.pos.x - r * 0.85 < c.maxX &&
        this.pos.z + r * 0.85 > c.minZ &&
        this.pos.z - r * 0.85 < c.maxZ &&
        this.pos.y >= c.minY - 0.35 &&
        this.pos.y <= c.maxY + 2.25
      ) {
        launchHero(c.maxY + 0.04, c.bounceVel || 17.8);
        return;
      }
    }
  }

  resolveVertical(wasOnGround, prevY = this.pos.y) {
    const r = this.radius * 0.92;
    for (const c of this.world.colliders) {
      if (c.disabled) continue;
      if (this.pos.x + r <= c.minX || this.pos.x - r >= c.maxX || this.pos.z + r <= c.minZ || this.pos.z - r >= c.maxZ) continue;
      if (this.pos.y < c.maxY && this.pos.y + this.height > c.minY) {
        if (c.isBounce) {
          if (this.bounceCooldown <= 0) {
            this.pos.y = Math.max(this.pos.y, c.maxY + 0.08);
            this.vel.y = Math.max(this.vel.y, c.bounceVel || 18.5);
            this.dashTimer = 0;
            this.onGround = false;
            this.standingPlatform = null;
            this.canDoubleJump = !!this.saveState.abilities.doubleJump;
            this.airDashReady = true;
            this.bounceCooldown = 0.24;
            audio.playBounce();
            this.world.spawnBurst(this.pos.clone().add(new THREE.Vector3(0, 0.3, 0)), 0x38bdf8, 18, 6.0);
          }
          continue;
        }
        if (this.vel.y <= 0 && prevY >= c.maxY - 0.18) {
          this.pos.y = c.maxY;
          if (!wasOnGround && this.vel.y < -6) audio.playLand();
          this.vel.y = 0;
          this.onGround = true;
          this.standingPlatform = c.moving || null;
          if (c.crumble && c.crumble.state === 'ready') {
            c.crumble.state = 'shaking';
            c.crumble.timer = 0.68;
          }
        } else if (this.vel.y > 0 && prevY + this.height <= c.minY + 0.18) {
          this.pos.y = c.minY - this.height;
          this.vel.y = 0;
        }
      }
    }
  }

  updateShadowBlob() {
    let bestY = -999;
    for (const c of this.world.colliders) {
      if (c.disabled) continue;
      if (this.pos.x >= c.minX - 0.2 && this.pos.x <= c.maxX + 0.2 && this.pos.z >= c.minZ - 0.2 && this.pos.z <= c.maxZ + 0.2 && c.maxY <= this.pos.y + 0.15 && c.maxY > bestY) {
        bestY = c.maxY;
      }
    }
    if (bestY > -900) {
      this.shadowBlob.visible = true;
      this.shadowBlob.position.set(this.pos.x, bestY + 0.016, this.pos.z);
      const dist = Math.max(0, this.pos.y - bestY);
      this.shadowBlob.scale.setScalar(Math.max(0.35, 1 - dist * 0.08));
      this.shadowBlob.material.opacity = Math.max(0.12, 0.45 - dist * 0.04);
    } else {
      this.shadowBlob.visible = false;
    }
  }

  checkHazards() {
    if (this.hp <= 0 || this.invulnTimer > 0) return;

    // 1. Pop-Up Spike Traps
    for (const st of this.world.spikeTraps || []) {
      if (!st.active) continue;
      if (
        Math.abs(this.pos.x - st.x) < st.w * 0.46 &&
        Math.abs(this.pos.z - st.z) < st.d * 0.46 &&
        this.pos.y <= st.y + 0.88 && this.pos.y >= st.y - 0.35
      ) {
        this.takeDamage(1);
        this.vel.y = 9.5;
        return;
      }
    }

    // 2. Spinning Blade Sweepers (jump or dash over!)
    for (const sp of this.world.spinners || []) {
      if (this.pos.y > sp.y + 0.92 || this.pos.y + this.height < sp.y + 0.25) continue;
      const dx = this.pos.x - sp.x;
      const dz = this.pos.z - sp.z;
      const ax = Math.cos(sp.angle);
      const az = -Math.sin(sp.angle);
      const along = dx * ax + dz * az;
      const perp = Math.abs(dx * -az + dz * ax);
      if (Math.abs(along) <= sp.radius + 0.26 && perp <= 0.42) {
        this.takeDamage(1);
        this.vel.y = 8.5;
        return;
      }
    }

    // 3. Sliding Crusher Ram + Bubbling Magma Trench Floor Burn Damage!
    for (const cr of this.world.crushers || []) {
      // 3a. Direct hit from Spiked Crusher Ram
      if (
        Math.abs(this.pos.x - cr.pos.x) < cr.w * 0.5 + this.radius + 0.14 &&
        Math.abs(this.pos.z - cr.pos.z) < cr.d * 0.5 + this.radius + 0.10 &&
        this.pos.y < cr.pos.y + cr.h * 0.5 &&
        this.pos.y + this.height > cr.pos.y - cr.h * 0.5
      ) {
        this.takeDamage(1);
        this.vel.x = (cr.velX >= 0 ? 1 : -1) * 10.5;
        this.vel.y = 6.8;
        this.world.spawnBurst(this.pos.clone().add(new THREE.Vector3(0, 0.5, 0)), 0xf97316, 14, 5.2);
        return;
      }
      // 3b. Stepping onto the Bubbling Magma Trench platform deals magma burn damage!
      if (
        cr.laneMinX !== undefined &&
        this.pos.x + this.radius * 0.55 > cr.laneMinX &&
        this.pos.x - this.radius * 0.55 < cr.laneMaxX &&
        this.pos.z + this.radius * 0.55 > cr.laneMinZ &&
        this.pos.z - this.radius * 0.55 < cr.laneMaxZ &&
        this.pos.y <= cr.laneY + 0.30 &&
        this.pos.y >= cr.laneY - 0.35
      ) {
        this.takeDamage(1);
        this.vel.y = 8.8;
        this.vel.z = (this.pos.z >= cr.laneZ ? 1 : -1) * 5.2;
        this.world.spawnBurst(this.pos.clone().add(new THREE.Vector3(0, 0.25, 0)), 0xf97316, 16, 5.6);
        return;
      }
    }

    // 4. Biome Floor Hazard Zones (Poison Thorns / Boiling Geysers / Flame Vents / Lava Pools)
    for (const hz of this.world.hazardZones || []) {
      if (
        Math.abs(this.pos.x - hz.x) < hz.w * 0.48 &&
        Math.abs(this.pos.z - hz.z) < hz.d * 0.48 &&
        this.pos.y <= hz.y + 0.32 && this.pos.y >= hz.y - 0.3
      ) {
        this.takeDamage(1);
        this.vel.y = 8.4;
        return;
      }
    }

    // 5. Arch-Free Sliding Circular Rotating Sawblades (jump over or dodge around!)
    const pCenter = this.pos.clone().add(new THREE.Vector3(0, 0.85, 0));
    for (const pd of this.world.pendulums || []) {
      if (
        Math.abs(this.pos.x - pd.headPos.x) < 1.25 &&
        Math.abs(this.pos.z - pd.headPos.z) < 0.56 &&
        this.pos.y < pd.y + 1.52 &&
        this.pos.y + this.height > pd.y + 0.08
      ) {
        this.takeDamage(1);
        this.vel.y = 8.4;
        return;
      }
    }

    // 6. Rune Turret Energy Orbs
    for (const o of this.world.turretOrbs || []) {
      if (pCenter.distanceTo(o.pos) < 0.85) {
        o.life = 0;
        this.takeDamage(1);
        this.vel.y = 6.5;
        return;
      }
    }
  }

  checkInteractions() {
    const center = this.pos.clone().add(new THREE.Vector3(0, 0.75, 0));

    // Checkpoints (Sculpted Crystal Checkpoint Shrine with CHECKPOINT -> CHECKPOINT ✓ activation!)
    for (const cp of this.world.checkpoints) {
      if (!cp.active && center.distanceTo(cp.pos) < 2.65) {
        cp.active = true;
        if (cp.activate) {
          cp.activate();
        } else if (cp.mat) {
          cp.mat.color.setHex(0x34d399);
          cp.mat.emissive.setHex(0x10b981);
          cp.mat.emissiveIntensity = 0.9;
        }
        if (cp.labelIdle) cp.labelIdle.visible = false;
        if (cp.labelActive) cp.labelActive.visible = true;
        this.spawnPos.copy(cp.spawnAt || cp.pos);
        audio.playCheckpoint();
        this.world.spawnBurst(cp.pos, 0x34d399, 20, 5.2);
      }
    }

    // Hidden Treasure Chests (Every 25th level!)
    for (const ch of this.world.chests) {
      if (!ch.opened && center.distanceTo(ch.pos) < 1.85) {
        ch.opened = true;
        ch.lid.rotation.x = -1.15;
        ch.glow.visible = false;
        audio.playChestOpen();
        this.world.spawnBurst(ch.pos, 0xfacc15, 24, 6.0);
        if (this.cb.onChestOpen) this.cb.onChestOpen(ch);
      }
    }

    // Goal Relic (Must defeat enough Guardians & Boss to shatter the Red Seal!)
    const gr = this.world.goalRelic;
    if (gr && !gr.collected && center.distanceTo(gr.pos) < 1.85) {
      if (gr.sealed) {
        if (this.relicWarnCooldown <= 0) {
          this.relicWarnCooldown = 2.0;
          if (this.cb.onRelicSealed) this.cb.onRelicSealed();
        }
      } else {
        gr.collected = true;
        gr.group.visible = false;
        audio.playLevelClear();
        this.world.spawnBurst(gr.pos, 0xfacc15, 26, 6.2);
        if (this.cb.onLevelComplete) this.cb.onLevelComplete(gr.title);
      }
    }

    // Safe Haven Portals
    if (this.portalCooldown <= 0) {
      for (const pt of this.world.portals) {
        if (center.distanceTo(pt.pos) < 1.85) {
          this.portalCooldown = 1.6;
          if (this.cb.onEnterPortal) this.cb.onEnterPortal(pt);
          break;
        }
      }
    }

    // Safe Haven Shop Stall
    if (this.world.shopPos && this.shopCooldown <= 0 && center.distanceTo(this.world.shopPos) < 2.2) {
      this.shopCooldown = 2.5;
      if (this.cb.onOpenShop) this.cb.onOpenShop();
    }

    // Safe Haven Save Crystal
    if (this.world.savePos && this.saveCooldown <= 0 && center.distanceTo(this.world.savePos) < 2.1) {
      this.saveCooldown = 3.0;
      this.healFull();
      audio.playSave();
      this.world.spawnBurst(this.world.savePos, 0x34d399, 18, 4.8);
      if (this.cb.onSaveCrystal) this.cb.onSaveCrystal();
    }
  }
}
