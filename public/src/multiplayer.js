// Skybound Relics — Live WebSocket Multiplayer Client (50–120+ Concurrent Players on Netlify Server!)
// Renders remote friends with 32x32 HD textures, glowing weapons, armor, smooth 60 FPS interpolation,
// live World/Guild chat, and Duel Arena PvP hits!
import * as THREE from '../lib/three.module.min.js';
import { AVATAR_OPTIONS, getGlowTier, getEquippedItem } from './state.js';
import { makeCharacterTextures } from './textures.js';
import { buildWeaponMesh } from './combat.js';

function makeNameplate(name, tag = '') {
  const canvas = document.createElement('canvas');
  canvas.width = 288;
  canvas.height = 48;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(2, 6, 23, 0.84)';
  ctx.fillRect(6, 5, 276, 38);
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 3;
  ctx.strokeRect(7, 6, 274, 36);
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const label = tag ? `[${tag}] ${name}` : name;
  ctx.fillText(label.slice(0, 22), 144, 25);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  sp.scale.set(3.6, 0.62, 1);
  return sp;
}

function buildRemoteAvatar(profile) {
  const g = new THREE.Group();
  const av = profile.avatar || {};
  const skinObj = AVATAR_OPTIONS.skin.find((s) => s.id === av.skin) || AVATAR_OPTIONS.skin[0];
  const hairColObj = AVATAR_OPTIONS.hairColor.find((h) => h.id === av.hairColor) || AVATAR_OPTIONS.hairColor[0];
  const outfitObj = AVATAR_OPTIONS.outfit.find((o) => o.id === av.outfit) || AVATAR_OPTIONS.outfit[0];

  const cTex = makeCharacterTextures(outfitObj.tunic, outfitObj.cape, outfitObj.boots);
  const mTunic = new THREE.MeshLambertMaterial({ map: cTex.tunicTex });
  const mSleeve = new THREE.MeshLambertMaterial({ map: cTex.sleeveTex });
  const mCape = new THREE.MeshLambertMaterial({ map: cTex.capeTex });
  const mBoots = new THREE.MeshLambertMaterial({ map: cTex.bootTex });
  const mSkin = new THREE.MeshLambertMaterial({ color: skinObj.hex });
  const mDark = new THREE.MeshLambertMaterial({ color: 0x0f172a });
  const mHair = new THREE.MeshLambertMaterial({ color: hairColObj.hex });

  const legL = new THREE.Group();
  legL.position.set(-0.14, 0.49, 0);
  const legLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.48, 0.24), mBoots);
  legLMesh.position.y = -0.24;
  legL.add(legLMesh);

  const legR = new THREE.Group();
  legR.position.set(0.14, 0.49, 0);
  const legRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.48, 0.24), mBoots);
  legRMesh.position.y = -0.24;
  legR.add(legRMesh);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.56, 0.34), mTunic);
  torso.position.set(0, 0.72, 0);
  const cape = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.56, 0.08), mCape);
  cape.position.set(0, 0.72, -0.22);

  const armL = new THREE.Group();
  armL.position.set(-0.37, 0.88, 0);
  const aLm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.18), mSleeve);
  aLm.position.y = -0.14;
  const hLm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.16), mSkin);
  hLm.position.y = -0.36;
  armL.add(aLm, hLm);

  const armR = new THREE.Group();
  armR.position.set(0.37, 0.88, 0);
  const aRm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.18), mSleeve);
  aRm.position.y = -0.14;
  const hRm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.16), mSkin);
  hRm.position.y = -0.36;
  const wpn = buildWeaponMesh(profile.weaponId || 'stone', profile.weaponLvl || 1);
  wpn.position.set(0, -0.34, 0.2);
  armR.add(aRm, hRm, wpn);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.44, 0.44), mSkin);
  head.position.set(0, 1.22, 0);
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.06), mDark);
  eyeL.position.set(-0.10, 1.25, 0.22);
  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.06), mDark);
  eyeR.position.set(0.10, 1.25, 0.22);

  if ((av.hairStyle || 'hat') === 'hat') {
    const mHat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.09, 0.64), mHat);
    brim.position.set(0, 1.44, 0);
    const crown = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.2, 0.46), mHat);
    crown.position.set(0, 1.57, 0);
    g.add(brim, crown);
  } else if (av.hairStyle !== 'bald') {
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.16, 0.48), mHair);
    hair.position.set(0, 1.44, 0);
    g.add(hair);
  }

  // Armor plates for Lv2+ friends
  const aLvl = profile.armorLvl || 1;
  if (aLvl >= 2) {
    const glow = getGlowTier(aLvl);
    const pMat = new THREE.MeshLambertMaterial({ color: glow.color, emissive: glow.emissive, emissiveIntensity: glow.intensity });
    const pL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.20, 0.34), pMat);
    pL.position.set(-0.40, 0.96, 0);
    const pR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.20, 0.34), pMat);
    pR.position.set(0.40, 0.96, 0);
    g.add(pL, pR);
  }

  const label = makeNameplate(profile.name || 'Explorer', profile.tag || '');
  label.position.set(0, 2.28, 0);

  g.add(legL, legR, torso, cape, armL, armR, head, eyeL, eyeR, label);
  return { group: g, legL, legR, armL, armR, cape, label };
}

function disposeGroup(obj) {
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

export class MultiplayerClient {
  constructor(scene, saveState, callbacks = {}) {
    this.scene = scene;
    this.saveState = saveState;
    this.cb = callbacks;
    this.root = new THREE.Group();
    this.scene.add(this.root);

    this.ws = null;
    this.connected = false;
    this.enabled = false;
    this.myId = null;
    this.onlineCount = 1;
    this.worldId = 'haven';
    this.levelNum = 0;

    this.peers = new Map(); // id -> { profile, rig, pos, targetPos, yaw, targetYaw, anim, walkCycle, attackTimer }
    this.sendAccum = 0;
    this.heartbeatAccum = 0;
    this.lastSentX = 9999;
    this.lastSentY = 9999;
    this.lastSentZ = 9999;
    this.lastSentYaw = 9999;
    this.reconnectTimer = null;
    this.sessionRefreshTimer = null;
  }

  getWsUrl() {
    if (typeof window !== 'undefined' && window.SKYBOUND_MP_URL) {
      return window.SKYBOUND_MP_URL;
    }
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${location.host}/ws`;
  }

  async init() {
    if (location.protocol === 'file:') return false;
    try {
      const res = await fetch('/api/mp/status', { cache: 'no-store' });
      if (!res.ok) return false;
      const data = await res.json();
      if (!data || !data.ok) return false;
      this.enabled = true;
      this.onlineCount = Math.max(1, data.online || 1);
      this.connect();
      return true;
    } catch {
      // Offline / local play.ps1 without Netlify Server — stay silently in solo/AI mode!
      return false;
    }
  }

  buildMyProfile(pos, yaw) {
    const eq = getEquippedItem(this.saveState);
    return {
      name: this.saveState.playerName || 'Explorer',
      tag: this.saveState.guild?.tag || '',
      worldId: this.worldId,
      levelNum: this.levelNum,
      x: pos ? Number(pos.x.toFixed(2)) : 0,
      y: pos ? Number(pos.y.toFixed(2)) : 1.2,
      z: pos ? Number(pos.z.toFixed(2)) : 16.5,
      yaw: Number((yaw || 0).toFixed(2)),
      weaponId: eq.weaponId,
      weaponLvl: eq.level || 1,
      armorLvl: this.saveState.armorLevel || 1,
      avatar: this.saveState.avatar || {},
    };
  }

  connect() {
    if (!this.enabled) return;
    if (this.ws && (this.ws.readyState === 0 || this.ws.readyState === 1)) return;
    clearTimeout(this.reconnectTimer);
    clearTimeout(this.sessionRefreshTimer);

    try {
      this.ws = new WebSocket(this.getWsUrl());
    } catch {
      return;
    }

    this.ws.onopen = () => {
      this.connected = true;
      const p = this.cb.getPlayer ? this.cb.getPlayer() : null;
      this.send({ type: 'hello', ...this.buildMyProfile(p?.pos, p?.facingYaw) });
      // Seamless pre-30-min refresh so players stay online across Netlify's 30-min WS connection cap!
      this.sessionRefreshTimer = setTimeout(() => {
        if (this.ws && this.ws.readyState === 1) this.ws.close(1012, 'Session refresh');
      }, 25 * 60 * 1000);
      if (this.cb.onStatusChange) this.cb.onStatusChange(true, this.onlineCount);
    };

    this.ws.onmessage = (e) => {
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }
      this.handleMessage(msg);
    };

    this.ws.onclose = (e) => {
      this.connected = false;
      clearTimeout(this.sessionRefreshTimer);
      this.clearPeers();
      if (this.cb.onStatusChange) this.cb.onStatusChange(false, 1);
      const delay = e.code === 1012 ? 150 : 1800;
      this.reconnectTimer = setTimeout(() => this.connect(), delay);
    };

    this.ws.onerror = () => {
      // handled cleanly by onclose
    };
  }

  send(obj) {
    if (this.ws && this.ws.readyState === 1) {
      try { this.ws.send(JSON.stringify(obj)); } catch {}
    }
  }

  handleMessage(msg) {
    if (!msg || !msg.type) return;

    if (msg.type === 'welcome') {
      this.myId = msg.id;
      this.onlineCount = Math.max(1, msg.online || 1);
      if (this.cb.onStatusChange) this.cb.onStatusChange(true, this.onlineCount);
      return;
    }

    if (msg.type === 'snapshot') {
      this.clearPeers();
      this.onlineCount = Math.max(1, msg.online || 1);
      for (const p of msg.peers || []) this.upsertPeer(p);
      if (this.cb.onStatusChange) this.cb.onStatusChange(true, this.onlineCount);
      return;
    }

    if (msg.type === 'join' && msg.player) {
      this.onlineCount = Math.max(1, msg.online || this.onlineCount);
      this.upsertPeer(msg.player);
      if (this.cb.onStatusChange) this.cb.onStatusChange(true, this.onlineCount);
      return;
    }

    if (msg.type === 'leave' && msg.id) {
      this.onlineCount = Math.max(1, msg.online || 1);
      this.removePeer(msg.id);
      if (this.cb.onStatusChange) this.cb.onStatusChange(true, this.onlineCount);
      return;
    }

    if (msg.type === 'online') {
      this.onlineCount = Math.max(1, msg.online || 1);
      if (this.cb.onStatusChange) this.cb.onStatusChange(true, this.onlineCount);
      if (msg.joinedName && this.cb.onSystemChat) {
        const tg = msg.joinedTag ? `[${msg.joinedTag}] ` : '';
        this.cb.onSystemChat(`${tg}${msg.joinedName} joined Skybound Relics! (${this.onlineCount} online)`, '#34d399');
      }
      return;
    }

    if (msg.type === 'state' && msg.id) {
      const peer = this.peers.get(msg.id);
      if (!peer) return;
      peer.targetPos.set(msg.x, msg.y, msg.z);
      peer.targetYaw = msg.yaw;
      peer.anim = msg.anim || 'idle';
      return;
    }

    if (msg.type === 'gear' && msg.player) {
      this.upsertPeer(msg.player, true);
      return;
    }

    if (msg.type === 'attack' && msg.id) {
      const peer = this.peers.get(msg.id);
      if (peer) peer.attackTimer = 0.25;
      return;
    }

    if (msg.type === 'pvp_hit' && this.cb.onPvpHit) {
      this.cb.onPvpHit(msg);
      return;
    }

    if (msg.type === 'chat' && this.cb.onChat) {
      this.cb.onChat(msg);
    }
  }

  upsertPeer(profile, rebuildMesh = false) {
    if (!profile || !profile.id || profile.id === this.myId) return;
    const existing = this.peers.get(profile.id);
    if (existing && !rebuildMesh) {
      existing.profile = profile;
      existing.targetPos.set(profile.x || 0, profile.y || 0, profile.z || 0);
      existing.targetYaw = profile.yaw || 0;
      return;
    }
    if (existing) this.removePeer(profile.id);

    const rig = buildRemoteAvatar(profile);
    const pos = new THREE.Vector3(profile.x || 0, profile.y || 0, profile.z || 0);
    rig.group.position.copy(pos);
    rig.group.rotation.y = profile.yaw || 0;
    this.root.add(rig.group);
    this.peers.set(profile.id, {
      id: profile.id,
      profile,
      rig,
      pos,
      targetPos: pos.clone(),
      yaw: profile.yaw || 0,
      targetYaw: profile.yaw || 0,
      anim: profile.anim || 'idle',
      walkCycle: Math.random() * 6,
      attackTimer: 0,
    });
  }

  removePeer(id) {
    const p = this.peers.get(id);
    if (!p) return;
    this.root.remove(p.rig.group);
    disposeGroup(p.rig.group);
    this.peers.delete(id);
  }

  clearPeers() {
    for (const id of [...this.peers.keys()]) this.removePeer(id);
  }

  setZone(worldId, levelNum, pos, yaw) {
    this.worldId = worldId;
    this.levelNum = levelNum || 0;
    this.clearPeers();
    if (this.connected) {
      this.send({ type: 'zone', ...this.buildMyProfile(pos, yaw) });
    }
  }

  sendGear(pos, yaw) {
    if (!this.connected) return;
    this.send({ type: 'gear', ...this.buildMyProfile(pos, yaw) });
  }

  sendChat(ch, text) {
    if (!this.connected) return;
    this.send({ type: 'chat', ch, text });
  }

  sendAttack(player) {
    if (!this.connected || !player) return;
    let targetId = null;
    let kx = 0, kz = 0;
    // In Duel Arena, detect closest opponent in front within 5.5m for live PvP hits!
    if (this.worldId === 'arena') {
      let bestD = 5.5;
      for (const peer of this.peers.values()) {
        const d = player.pos.distanceTo(peer.pos);
        if (d < bestD) {
          bestD = d;
          targetId = peer.id;
          const dx = peer.pos.x - player.pos.x;
          const dz = peer.pos.z - player.pos.z;
          const len = Math.hypot(dx, dz) || 1;
          kx = dx / len;
          kz = dz / len;
        }
      }
    }
    this.send({ type: 'attack', targetId, kx, kz });
  }

  update(dt, elapsed, player, worldId, levelNum) {
    // 1. Send local player transform at 12 Hz (only when moving or 0.9s heartbeat)
    if (this.connected && player) {
      this.sendAccum += dt;
      this.heartbeatAccum += dt;
      if (this.sendAccum >= 0.083) {
        const dx = Math.abs(player.pos.x - this.lastSentX);
        const dy = Math.abs(player.pos.y - this.lastSentY);
        const dz = Math.abs(player.pos.z - this.lastSentZ);
        const dyaw = Math.abs(player.facingYaw - this.lastSentYaw);
        if (dx > 0.03 || dy > 0.03 || dz > 0.03 || dyaw > 0.04 || this.heartbeatAccum >= 0.9) {
          this.sendAccum = 0;
          this.heartbeatAccum = 0;
          this.lastSentX = player.pos.x;
          this.lastSentY = player.pos.y;
          this.lastSentZ = player.pos.z;
          this.lastSentYaw = player.facingYaw;
          const spd = Math.hypot(player.vel.x, player.vel.z);
          const anim = !player.onGround ? 'jump' : (spd > 0.4 ? 'walk' : 'idle');
          this.send({
            type: 'state',
            x: Number(player.pos.x.toFixed(2)),
            y: Number(player.pos.y.toFixed(2)),
            z: Number(player.pos.z.toFixed(2)),
            yaw: Number(player.facingYaw.toFixed(2)),
            anim,
          });
        }
      }
    }

    // 2. Smoothly interpolate & animate all remote players in this zone at 60 FPS!
    const lerpAmt = Math.min(1, dt * 11);
    for (const peer of this.peers.values()) {
      const moveDist = peer.pos.distanceTo(peer.targetPos);
      if (moveDist > 12) peer.pos.copy(peer.targetPos);
      else peer.pos.lerp(peer.targetPos, lerpAmt);

      let yawDiff = peer.targetYaw - peer.yaw;
      while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
      while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
      peer.yaw += yawDiff * lerpAmt;

      peer.rig.group.position.copy(peer.pos);
      peer.rig.group.rotation.y = peer.yaw;

      // Distance-cull far nameplates (>34m) to keep 50+ player crowds buttery smooth!
      if (player) {
        peer.rig.label.visible = player.pos.distanceTo(peer.pos) < 34;
      }

      if (peer.attackTimer > 0) peer.attackTimer = Math.max(0, peer.attackTimer - dt);

      if (peer.anim === 'jump') {
        peer.rig.legL.rotation.x = 0.35;
        peer.rig.legR.rotation.x = -0.25;
        peer.rig.armL.rotation.x = -0.55;
        peer.rig.armR.rotation.x = peer.attackTimer > 0 ? -1.75 : -0.55;
        peer.rig.cape.rotation.x = 0.55;
      } else if (peer.anim === 'walk' || moveDist > 0.14) {
        peer.walkCycle += dt * 11;
        const sw = Math.sin(peer.walkCycle) * 0.62;
        peer.rig.legL.rotation.x = sw;
        peer.rig.legR.rotation.x = -sw;
        peer.rig.armL.rotation.x = -sw * 0.8;
        peer.rig.armR.rotation.x = peer.attackTimer > 0 ? -1.75 : sw * 0.65;
        peer.rig.cape.rotation.x = 0.25 + Math.abs(sw) * 0.22;
      } else {
        peer.rig.legL.rotation.x *= 0.82;
        peer.rig.legR.rotation.x *= 0.82;
        peer.rig.armL.rotation.x *= 0.82;
        peer.rig.armR.rotation.x = peer.attackTimer > 0 ? -1.75 : peer.rig.armR.rotation.x * 0.82;
        peer.rig.cape.rotation.x = 0.10;
      }
    }
  }
}
