import * as THREE from '../lib/three.module.min.js';
import { IS_OWNER_BUILD } from './config.js';
import { createVoxelMaterials } from './textures.js';
import { createSkyDomeSystem } from './skyAndWater.js';
import { HUD_ICONS, getWeaponIcon } from './icons.js';
import {
  BAG_MAX_SLOTS, WORLD_ORDER, WORLD_META, WEAPON_CATALOG, WEAPON_IDS, ARROW_TYPES,
  AVATAR_OPTIONS, GAME_STORY, QUEST_CATALOG, STARTER_GUILDS, GUILD_MAX_MEMBERS, GUILD_BUFF_OPTIONS, ARENA_TIERS, getGuildDifficulty, getQuestProgress, getActiveTrackedQuest,
  getGlowTier, createDefaultSave, loadGameSave, writeGameSave,
  exportSaveCode, importSaveCode, getEquippedItem, addItemToBag, getItemSellPrice,
  sellBagItem, getItemDamage, getWeaponUpgradeCost, getArmorUpgradeCost,
  getStatUpgradeCost, addCredits,
} from './state.js';
import { buildSafeHavenDef, buildSkyArenaDef, generateBiomeLevel } from './biomes.js';
import { buildLevelWorld } from './world.js';
import { CombatSystem } from './combat.js';
import { VoxelPlayer } from './player.js';
import { MultiplayerClient } from './multiplayer.js';
import { audio } from './audio.js';

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const hudTop = document.getElementById('hudTop');
const mobileControls = document.getElementById('mobileControls');
const dragPad = document.getElementById('dragPad');
const dragIndicator = document.getElementById('dragIndicator');
const npcPrompt = document.getElementById('npcPrompt');

const startOverlay = document.getElementById('startOverlay');
const optionOverlay = document.getElementById('optionOverlay');
const tutorialOverlay = document.getElementById('tutorialOverlay');
const npcOverlay = document.getElementById('npcOverlay');
const questOverlay = document.getElementById('questOverlay');
const guildOverlay = document.getElementById('guildOverlay');
const arenaOverlay = document.getElementById('arenaOverlay');
const avatarOverlay = document.getElementById('avatarOverlay');
const bagOverlay = document.getElementById('bagOverlay');
const shopOverlay = document.getElementById('shopOverlay');
const adminOverlay = document.getElementById('adminOverlay');
const worldsOverlay = document.getElementById('worldsOverlay');
const saveOverlay = document.getElementById('saveOverlay');
const keysOverlay = document.getElementById('keysOverlay');
const levelClearOverlay = document.getElementById('levelClearOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');

const startBtn = document.getElementById('startBtn');
const optionBtn = document.getElementById('optionBtn');
const tutorialBtn = document.getElementById('tutorialBtn');
const closeTutorialBtn = document.getElementById('closeTutorialBtn');
const resumeBtn = document.getElementById('resumeBtn');
const hudBagBtn = document.getElementById('hudBagBtn');
const hudStoreBtn = document.getElementById('hudStoreBtn');
const hudQuestBtn = document.getElementById('hudQuestBtn');
const hudGuildBtn = document.getElementById('hudGuildBtn');
const hudArenaBtn = document.getElementById('hudArenaBtn');
const weaponIconSlot = document.getElementById('weaponIconSlot');
const coinIconSlot = document.getElementById('coinIconSlot');

const avatarBtn = document.getElementById('avatarBtn');
const closeAvatarBtn = document.getElementById('closeAvatarBtn');
const closeBagBtn = document.getElementById('closeBagBtn');
const closeShopBtn = document.getElementById('closeShopBtn');
const closeQuestBtn = document.getElementById('closeQuestBtn');
const closeGuildBtn = document.getElementById('closeGuildBtn');
const closeArenaBtn = document.getElementById('closeArenaBtn');
const closeNpcBtn = document.getElementById('closeNpcBtn');
const npcActionBtn = document.getElementById('npcActionBtn');
const adminMenuBtn = document.getElementById('adminMenuBtn');
const closeAdminBtn = document.getElementById('closeAdminBtn');
const worldsBtn = document.getElementById('worldsBtn');
const closeWorldsBtn = document.getElementById('closeWorldsBtn');
const previewToggleBtn = document.getElementById('previewToggleBtn');
const saveMenuBtn = document.getElementById('saveMenuBtn');
const closeSaveBtn = document.getElementById('closeSaveBtn');
const saveNowBtn = document.getElementById('saveNowBtn');
const exportSaveBtn = document.getElementById('exportSaveBtn');
const importSaveBtn = document.getElementById('importSaveBtn');
const resetSaveBtn = document.getElementById('resetSaveBtn');
const saveCodeBox = document.getElementById('saveCodeBox');
const saveStatus = document.getElementById('saveStatus');
const havenBtn = document.getElementById('havenBtn');

const levelBadgeEl = document.getElementById('levelBadge');
const heartsEl = document.getElementById('heartsDisplay');
const weaponEl = document.getElementById('weaponDisplay');
const creditsEl = document.getElementById('creditsDisplay');
const toastEl = document.getElementById('toast');
const csCrosshair = document.getElementById('csCrosshair');
const questTrackerHud = document.getElementById('questTrackerHud');
const qtBody = document.getElementById('qtBody');
const qtLogBtn = document.getElementById('qtLogBtn');
const qtMinBtn = document.getElementById('qtMinBtn');

const bagSummary = document.getElementById('bagSummary');
const bagArrowRow = document.getElementById('bagArrowRow');
const bagList = document.getElementById('bagList');
const shopTitle = document.getElementById('shopTitle');
const shopSubtitle = document.getElementById('shopSubtitle');
const shopCredits = document.getElementById('shopCredits');
const shopBagCount = document.getElementById('shopBagCount');
const shopTabContent = document.getElementById('shopTabContent');
const tabWeapons = document.getElementById('tabWeapons');
const tabUpgrades = document.getElementById('tabUpgrades');
const tabSell = document.getElementById('tabSell');
const tabCredits = document.getElementById('tabCredits');
const worldsList = document.getElementById('worldsList');

const chatWrap = document.getElementById('chatWrap');
const chatLog = document.getElementById('chatLog');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMinBtn = document.getElementById('chatMinBtn');
const chatTabAll = document.getElementById('chatTabAll');
const chatTabGuild = document.getElementById('chatTabGuild');
const chatTabSys = document.getElementById('chatTabSys');

const levelClearTitle = document.getElementById('levelClearTitle');
const levelClearInfo = document.getElementById('levelClearInfo');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const clearHavenBtn = document.getElementById('clearHavenBtn');
const retryBtn = document.getElementById('retryBtn');
const goHavenBtn = document.getElementById('goHavenBtn');

const pixelModeBtn = document.getElementById('pixelModeBtn');
const bgmBtn = document.getElementById('bgmBtn');
const muteBtn = document.getElementById('muteBtn');
const inputModeBtn = document.getElementById('inputModeBtn');
const camModeBtn = document.getElementById('camModeBtn');
const autoAimBtn = document.getElementById('autoAimBtn');
const keysBtn = document.getElementById('keysBtn');
const closeKeysBtn = document.getElementById('closeKeysBtn');
const bindGrid = document.getElementById('bindGrid');
const presetWasd = document.getElementById('presetWasd');
const presetArrows = document.getElementById('presetArrows');
const presetReset = document.getElementById('presetReset');
const controlsSummary = document.getElementById('controlsSummary');

// Initialize HUD Pixel Icons
coinIconSlot.innerHTML = HUD_ICONS.coin;
hudStoreBtn.innerHTML = `${HUD_ICONS.store}<span>STORE</span>`;
hudQuestBtn.innerHTML = `${HUD_ICONS.quest}<span>QUEST</span>`;
hudGuildBtn.innerHTML = `${HUD_ICONS.guild}<span>GUILD</span>`;
hudArenaBtn.innerHTML = `${HUD_ICONS.arena}<span>ARENA</span>`;

// Persistent Save State
let saveState = loadGameSave() || createDefaultSave();
if (!IS_OWNER_BUILD) {
  saveState.previewAll = false;
  saveState.godMode = false;
  previewToggleBtn.classList.add('hidden');
  adminMenuBtn.classList.add('hidden');
} else {
  adminMenuBtn.classList.remove('hidden');
}

// Renderer & Scene (Crisp Minecraft/Roblox-Grade HD Voxel Graphics with Vibrant Filmic Color!)
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.96;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

let retroPixelMode = false;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#2b8df2');
scene.fog = new THREE.Fog('#b8e0ff', 72, 205);
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 280);

function updateResolution() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const scale = retroPixelMode ? 0.44 : Math.min(window.devicePixelRatio || 1, 2);
  canvas.classList.toggle('retro-pixels', retroPixelMode);
  renderer.setPixelRatio(1);
  renderer.setSize(Math.max(320, Math.floor(w * scale)), Math.max(180, Math.floor(h * scale)), false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
updateResolution();
window.addEventListener('resize', updateResolution);

const hemiLight = new THREE.HemisphereLight(0x9bd6ff, 0x3b6e58, 0.78);
scene.add(hemiLight);
const sun = new THREE.DirectionalLight(0xfff0cc, 1.55);
sun.position.set(36, 58, 28);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.00015;
sun.shadow.normalBias = 0.06;
sun.shadow.camera.near = 6;
sun.shadow.camera.far = 190;
const d = 78;
sun.shadow.camera.left = -d; sun.shadow.camera.right = d;
sun.shadow.camera.top = d; sun.shadow.camera.bottom = -d;
scene.add(sun);
scene.add(sun.target);
const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.38);
rimLight.position.set(-34, 24, -36);
scene.add(rimLight);
const skyDome = createSkyDomeSystem(scene);

const mats = createVoxelMaterials();

let world = null;
let combat = null;
let activeWorldId = 'haven';
let activeLevelNum = 0;
let started = false;
let creatingCharacter = false;
let paused = false;
let openMenu = null;
let shopTab = 'weapons';
let shopReturnAction = null;
let activeNpc = null;
let nearbyNpc = null;
let elapsed = 0;
let toastTimer = null;

// =========================================================================
// RPG CHATBOX SYSTEM (World / Guild / System — Multiplayer Ready!)
// =========================================================================
const chatMessages = [
  { ch: 'sys', sender: 'STORY', text: 'The Sky Crown was shattered across 4 realms. Talk to Elder Rowan in Safe Haven to begin!', color: '#facc15' },
  { ch: 'all', sender: 'Elder Rowan', text: 'Welcome to Safe Haven, Explorer! Step near me and press T to take quests.', color: '#67e8f9' },
];
let activeChatTab = 'all';

function addChatMsg(ch, sender, text, color = '#e2e8f0') {
  chatMessages.push({ ch, sender, text, color });
  if (chatMessages.length > 60) chatMessages.shift();
  renderChat();
}

function escHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderChat() {
  chatLog.innerHTML = '';
  const list = chatMessages.filter((m) => activeChatTab === 'all' || m.ch === activeChatTab || (activeChatTab === 'guild' && m.ch === 'guild'));
  for (const m of list.slice(-24)) {
    const div = document.createElement('div');
    const tag = m.ch === 'guild' ? '[GUILD] ' : m.ch === 'sys' ? '[SYS] ' : '';
    div.innerHTML = `<span style="color:${escHtml(m.color)};font-weight:700;">${tag}${escHtml(m.sender)}:</span> `;
    const span = document.createElement('span');
    span.textContent = m.text;
    div.appendChild(span);
    chatLog.appendChild(div);
  }
  chatLog.scrollTop = chatLog.scrollHeight;
}

function setChatTab(t) {
  activeChatTab = t;
  chatTabAll.classList.toggle('active', t === 'all');
  chatTabGuild.classList.toggle('active', t === 'guild');
  chatTabSys.classList.toggle('active', t === 'sys');
  renderChat();
}
chatTabAll.addEventListener('click', () => setChatTab('all'));
chatTabGuild.addEventListener('click', () => setChatTab('guild'));
chatTabSys.addEventListener('click', () => setChatTab('sys'));
chatMinBtn.addEventListener('click', () => {
  const min = chatWrap.classList.toggle('minimized');
  chatMinBtn.textContent = min ? 'CHAT' : '−';
});
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const txt = chatInput.value.trim();
  if (!txt) return;
  const gTag = saveState.guild ? `[${saveState.guild.tag}] ` : '';
  const ch = activeChatTab === 'guild' ? 'guild' : 'all';
  if (ch === 'guild' && !saveState.guild) {
    addChatMsg('sys', 'SYSTEM', 'Join or create a Guild first to chat in Guild channel!', '#fb7185');
  } else {
    addChatMsg(ch, `${gTag}${saveState.playerName || 'You'}`, txt, ch === 'guild' ? '#38bdf8' : '#34d399');
    if (typeof mp !== 'undefined' && mp) mp.sendChat(ch, txt);
  }
  chatInput.value = '';
  chatInput.blur();
});
renderChat();

// =========================================================================
// HUD & MENU HELPERS
// =========================================================================
function showToast(text, color = '#facc15') {
  toastEl.textContent = text;
  toastEl.style.borderColor = color;
  toastEl.style.color = color;
  toastEl.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.add('hidden'), 2600);
}

function renderHearts(hp, maxHp, shield = 0, regenSecs = 0) {
  heartsEl.innerHTML = '';
  for (let i = 0; i < maxHp; i++) {
    const s = document.createElement('span');
    s.textContent = i < hp ? '♥' : '♡';
    s.style.color = i < hp ? '#fb7185' : '#475569';
    heartsEl.appendChild(s);
  }
  for (let i = 0; i < shield; i++) {
    const sh = document.createElement('span');
    sh.textContent = '◆';
    sh.style.color = '#38bdf8';
    sh.style.fontSize = '13px';
    heartsEl.appendChild(sh);
  }
  if (hp > 0 && hp < maxHp && regenSecs > 0) {
    const rg = document.createElement('span');
    rg.textContent = ` +♥ ${regenSecs}s`;
    rg.style.color = '#fda4af';
    rg.style.fontSize = '10px';
    rg.style.fontWeight = '700';
    rg.style.marginLeft = '4px';
    heartsEl.appendChild(rg);
  }
}

function hasClaimableQuest() {
  return QUEST_CATALOG.some((q) => {
    const acc = saveState.quests.accepted.includes(q.id);
    const clm = saveState.quests.claimed.includes(q.id);
    return acc && !clm && getQuestProgress(saveState, q) >= q.target;
  });
}

function refreshHud() {
  const meta = WORLD_META[activeWorldId] || WORLD_META.haven;
  const gDiff = getGuildDifficulty(saveState);
  const hardTag = gDiff.active ? ' · GUILD HARD' : '';
  if (activeWorldId === 'haven') {
    levelBadgeEl.textContent = gDiff.active ? 'SAFE HAVEN · GUILD' : 'SAFE HAVEN';
    levelBadgeEl.style.color = '#facc15';
  } else if (activeWorldId === 'arena') {
    const alive = combat ? combat.enemies.filter((e) => !e.dead).length : 0;
    const total = combat ? combat.enemies.length : 0;
    levelBadgeEl.textContent = `ARENA T${activeLevelNum} · AI ${total - alive}/${total}${hardTag}`;
    levelBadgeEl.style.color = alive === 0 ? '#34d399' : '#fda4af';
  } else {
    const obj = combat ? combat.getObjectiveStatus() : null;
    if (obj && obj.total > 0) {
      if (obj.unlocked) {
        levelBadgeEl.textContent = `${meta.short} ${activeLevelNum}/100 · RELIC OPEN!${hardTag}`;
        levelBadgeEl.style.color = '#34d399';
      } else {
        const tag = obj.bossAlive && obj.defeated >= obj.required ? 'BOSS' : `${obj.defeated}/${obj.required}`;
        levelBadgeEl.textContent = `${meta.short} ${activeLevelNum}/100 · FOES ${tag}${hardTag}`;
        levelBadgeEl.style.color = gDiff.active ? '#fda4af' : '#facc15';
      }
    } else {
      levelBadgeEl.textContent = `${meta.short} ${activeLevelNum}/100${hardTag}`;
      levelBadgeEl.style.color = '#facc15';
    }
  }
  const eq = getEquippedItem(saveState);
  const wDef = WEAPON_CATALOG[eq.weaponId] || WEAPON_CATALOG.stone;
  const glow = getGlowTier(eq.level || 1);
  weaponIconSlot.innerHTML = getWeaponIcon(wDef.model, glow.hex, 18);
  weaponEl.textContent = `${wDef.name} Lv${eq.level || 1}`;
  weaponEl.style.color = glow.hex;
  creditsEl.textContent = String(saveState.credits);
  hudBagBtn.innerHTML = `${HUD_ICONS.bag}<span>BAG ${saveState.bagSlots.length}/${BAG_MAX_SLOTS}</span>`;
  hudQuestBtn.classList.toggle('quest-ready', hasClaimableQuest());
  const regenSecs = (player.hp > 0 && player.hp < player.maxHp) ? Math.ceil(player.heartRegenInterval - player.heartRegenTimer) : 0;
  renderHearts(player.hp, player.maxHp, player.armorShield, regenSecs);
}

function closeAllMenus() {
  openMenu = null;
  listeningAction = null;
  if (document.activeElement && document.activeElement !== document.body && document.activeElement.blur) {
    document.activeElement.blur();
  }
  optionOverlay.classList.add('hidden');
  tutorialOverlay.classList.add('hidden');
  npcOverlay.classList.add('hidden');
  questOverlay.classList.add('hidden');
  guildOverlay.classList.add('hidden');
  arenaOverlay.classList.add('hidden');
  avatarOverlay.classList.add('hidden');
  bagOverlay.classList.add('hidden');
  shopOverlay.classList.add('hidden');
  adminOverlay.classList.add('hidden');
  worldsOverlay.classList.add('hidden');
  saveOverlay.classList.add('hidden');
  keysOverlay.classList.add('hidden');
  updateCsAimUi();
}

function showMenu(name) {
  closeAllMenus();
  openMenu = name;
  keys.clear();
  if (document.pointerLockElement === canvas && document.exitPointerLock) document.exitPointerLock();
  if (typeof hoverMouse !== 'undefined') { hoverMouse.hasPrev = false; hoverMouse.overCanvas = false; }
  dragIndicator.style.display = 'none';
  updateCsAimUi();
  if (name === 'option') { updateControlsSummary(); optionOverlay.classList.remove('hidden'); }
  else if (name === 'tutorial') { tutorialOverlay.classList.remove('hidden'); }
  else if (name === 'npc') { renderNpcModal(); npcOverlay.classList.remove('hidden'); }
  else if (name === 'quest') { renderQuestLog(); questOverlay.classList.remove('hidden'); }
  else if (name === 'guild') { renderGuildModal(); guildOverlay.classList.remove('hidden'); }
  else if (name === 'arena') { renderArenaModal(); arenaOverlay.classList.remove('hidden'); }
  else if (name === 'avatar') { renderAvatarPanel(true); avatarOverlay.classList.remove('hidden'); }
  else if (name === 'bag') { renderBagPanel(); bagOverlay.classList.remove('hidden'); }
  else if (name === 'shop') { renderShopPanel(); shopOverlay.classList.remove('hidden'); }
  else if (name === 'admin' && IS_OWNER_BUILD) { refreshAdminButtons(); adminOverlay.classList.remove('hidden'); }
  else if (name === 'worlds') { renderWorldsPanel(); worldsOverlay.classList.remove('hidden'); }
  else if (name === 'save') { saveStatus.textContent = 'Click SAVE NOW or copy your Save Code to transfer to Android.'; saveOverlay.classList.remove('hidden'); }
  else if (name === 'keys') { renderBindGrid(); keysOverlay.classList.remove('hidden'); }
}

// Create Player
const onlinePill = document.getElementById('onlinePill');
const onlineCountEl = document.getElementById('onlineCountEl');
const mp = new MultiplayerClient(scene, saveState, {
  getPlayer: () => player,
  onStatusChange: (connected, count) => {
    if (onlinePill) onlinePill.classList.toggle('hidden', !connected);
    if (onlineCountEl) onlineCountEl.textContent = String(count || 1);
  },
  onChat: (msg) => {
    const tg = msg.tag ? `[${msg.tag}] ` : '';
    addChatMsg(msg.ch === 'guild' ? 'guild' : 'all', `${tg}${msg.sender}`, msg.text, msg.ch === 'guild' ? '#38bdf8' : '#fef08a');
  },
  onSystemChat: (text, color) => addChatMsg('sys', 'ONLINE', text, color || '#34d399'),
  onPvpHit: (msg) => {
    if (activeWorldId !== 'arena' || paused) return;
    const kd = new THREE.Vector3(msg.kx || 0, 0, msg.kz || 0);
    player.takeDamage(msg.dmg || 1, kd.lengthSq() > 0.01 ? kd : null);
    showToast(`HIT BY ${String(msg.fromName || 'RIVAL').toUpperCase()}!`, '#fb7185');
  },
});

const player = new VoxelPlayer(scene, saveState, {
  onAttack: (p) => mp.sendAttack(p),
  onGearChange: (p) => mp.sendGear(p.pos, p.facingYaw),
  onHpChange: renderHearts,
  onHealToast: (msg) => showToast(msg, '#fb7185'),
  onGameOver: () => { paused = true; gameOverOverlay.classList.remove('hidden'); },
  onEnterPortal: (pt) => {
    if (!pt.unlocked) { showToast('LOCKED: CLEAR PREVIOUS WORLD LV 100 FIRST!', '#fb7185'); return; }
    audio.playPortal();
    if (pt.worldId === 'arena') {
      showMenu('arena');
      return;
    }
    addChatMsg('sys', 'PORTAL', `Warping to ${WORLD_META[pt.worldId].name}!`, '#38bdf8');
    enterStage(pt.worldId, saveState.maxLevel[pt.worldId] || 1);
  },
  onOpenShop: () => {
    shopReturnAction = 'game';
    shopTitle.textContent = 'SAFE HAVEN STORE';
    shopSubtitle.textContent = 'Browse Weapons, Arrows, Upgrades, or Sell items from your 15-slot Bag!';
    closeShopBtn.textContent = 'CLOSE';
    showMenu('shop');
  },
  onSaveCrystal: () => {
    writeGameSave(saveState);
    refreshHud();
    showToast('HEALED & GAME SAVED!', '#34d399');
    addChatMsg('sys', 'SAVE', 'Full health restored and progress saved.', '#34d399');
  },
  onChestOpen: (ch) => {
    saveState.openedChests[ch.id] = true;
    addCredits(saveState, ch.bonusCredits);
    const res = addItemToBag(saveState, ch.rewardWeapon, 2);
    if (res.ok) {
      const msg = `HIDDEN CHEST: ${WEAPON_CATALOG[ch.rewardWeapon].name} Lv2 + ${ch.bonusCredits} CR!`;
      showToast(msg, '#facc15');
      addChatMsg('sys', 'CHEST', msg, '#facc15');
    } else {
      const eq = getEquippedItem(saveState);
      eq.level = Math.min(6, (eq.level || 1) + 1);
      player.refreshGearVisuals();
      showToast(`HIDDEN CHEST: EQUIPPED WPN → Lv${eq.level} + ${ch.bonusCredits} CR!`, '#facc15');
    }
    writeGameSave(saveState);
    refreshHud();
  },
  onRelicSealed: () => {
    const obj = combat ? combat.getObjectiveStatus() : null;
    if (!obj) return;
    const rem = Math.max(0, obj.required - obj.defeated);
    const msg = obj.bossAlive && rem === 0
      ? 'RELIC SEALED! DEFEAT THE WARDEN BOSS FIRST!'
      : `RELIC SEALED! DEFEAT ${rem} MORE GUARDIAN${rem === 1 ? '' : 'S'}${obj.bossAlive ? ' & BOSS' : ''}!`;
    showToast(msg, '#fb7185');
  },
  onLevelComplete: () => {
    paused = true;
    const wId = activeWorldId;
    const lvl = activeLevelNum;
    const clearBonus = 22 + (WORLD_META[wId].order - 1) * 16 + Math.floor(lvl * 0.75);
    addCredits(saveState, clearBonus);
    if (lvl % 10 === 0) saveState.bossesCleared = (saveState.bossesCleared || 0) + 1;

    if (lvl < 100) {
      saveState.maxLevel[wId] = Math.max(saveState.maxLevel[wId] || 1, lvl + 1);
      saveState.lastWorld = wId;
      saveState.lastLevel = lvl + 1;
    } else {
      saveState.completedWorlds[wId] = true;
      const wIdx = WORLD_ORDER.indexOf(wId);
      if (wIdx >= 0 && wIdx + 1 < WORLD_ORDER.length) {
        const nextW = WORLD_ORDER[wIdx + 1];
        saveState.unlockedWorlds[nextW] = true;
        saveState.lastWorld = nextW;
        saveState.lastLevel = 1;
        addChatMsg('sys', 'WORLD UNLOCK', `${WORLD_META[nextW].name} portal is now OPEN in Safe Haven!`, '#facc15');
      }
    }
    writeGameSave(saveState);
    refreshHud();
    addChatMsg('sys', 'CLEAR', `${WORLD_META[wId].name} Lv.${lvl} cleared! +${clearBonus} CR`, '#34d399');

    if (lvl % 10 === 0) {
      shopReturnAction = 'nextLevel';
      shopTitle.textContent = `LEVEL ${lvl} MERCHANT STORE`;
      shopSubtitle.textContent = `Stage Clear (+${clearBonus} CR)! Upgrade Weapon, Armor & Stats before moving on!`;
      closeShopBtn.textContent = lvl < 100 ? `CONTINUE TO LV ${lvl + 1} →` : 'RETURN TO SAFE HAVEN →';
      showMenu('shop');
      return;
    }

    levelClearTitle.textContent = `${WORLD_META[wId].short} LEVEL ${lvl} CLEAR!`;
    levelClearInfo.textContent = `Reward: +${clearBonus} Credits · Auto-Saved!`;
    nextLevelBtn.textContent = lvl < 100 ? `NEXT LEVEL (${lvl + 1}) →` : 'RETURN TO SAFE HAVEN';
    levelClearOverlay.classList.remove('hidden');
  },
});

function enterStage(worldId, levelNum = 0) {
  activeWorldId = worldId;
  activeLevelNum = worldId === 'haven' ? 0 : (worldId === 'arena' ? Math.max(1, Math.min(ARENA_TIERS.length, levelNum || 1)) : Math.max(1, Math.min(100, levelNum)));
  const trackChanged = audio.setTrack(worldId);
  if (trackChanged && started) {
    addChatMsg('sys', 'MUSIC', `♪ Now Playing: ${audio.getTrackTitle(worldId)}`, '#a78bfa');
  }
  if (worldId !== 'arena') {
    saveState.currentWorld = activeWorldId;
    if (worldId !== 'haven') {
      saveState.lastWorld = worldId;
      saveState.lastLevel = activeLevelNum;
    }
  }

  if (world) world.dispose();
  if (combat) combat.clear();

  const def = worldId === 'haven'
    ? buildSafeHavenDef(saveState)
    : (worldId === 'arena' ? buildSkyArenaDef(activeLevelNum, saveState) : generateBiomeLevel(worldId, activeLevelNum));

  scene.background.set(def.sky);
  skyDome.setAtmosphere(worldId, { sun, hemi: hemiLight, rim: rimLight }, def.fog);

  world = buildLevelWorld(scene, mats, def, saveState.openedChests);
  combat = new CombatSystem(scene, world, saveState, {
    onCoin: (val) => {
      addCredits(saveState, val);
      creditsEl.textContent = String(saveState.credits);
    },
    onEnemyDefeated: (isBoss) => {
      saveState.totalKills = (saveState.totalKills || 0) + 1;
      if (activeWorldId === 'arena') {
        refreshHud();
        const remaining = combat.enemies.filter((e) => !e.dead).length;
        if (remaining === 0) {
          paused = true;
          const tier = ARENA_TIERS[Math.max(0, Math.min(ARENA_TIERS.length - 1, activeLevelNum - 1))];
          const gDiff = getGuildDifficulty(saveState);
          const reward = tier.reward + (gDiff.active ? 15 : 0);
          addCredits(saveState, reward);
          saveState.arenaWins = (saveState.arenaWins || 0) + 1;
          saveState.arenaBestTier = Math.max(saveState.arenaBestTier || 0, tier.tier);
          writeGameSave(saveState);
          refreshHud();
          audio.playLevelClear();
          addChatMsg('sys', 'ARENA', `VICTORY in ${tier.name}! +${reward} CR (${saveState.arenaWins} Total Wins)`, '#facc15');
          levelClearTitle.textContent = `ARENA VICTORY! (${tier.name.toUpperCase()})`;
          levelClearInfo.textContent = `Reward: +${reward} Credits${gDiff.active ? ' (incl. +15 Guild Hard Bonus!)' : ''} · Total Wins: ${saveState.arenaWins}`;
          nextLevelBtn.textContent = tier.tier < ARENA_TIERS.length ? `NEXT TIER (TIER ${tier.tier + 1}) →` : 'REMATCH MYTHIC TRIAL →';
          levelClearOverlay.classList.remove('hidden');
        }
        return;
      }

      const obj = combat.getObjectiveStatus();
      if (obj.unlocked && world?.goalRelic?.sealed) {
        world.setRelicUnlocked(true);
        audio.playCheckpoint();
        showToast('SKY RELIC UNSEALED! CLAIM IT TO FINISH!', '#34d399');
        addChatMsg('sys', 'RELIC', 'Guardian seal shattered! Claim the Sky Relic!', '#34d399');
      }
      refreshHud();
      if (isBoss) addChatMsg('sys', 'BOSS', 'Warden Boss defeated! Collect the coin shower!', '#facc15');
    },
    onWeaponLooted: (weaponId) => {
      const wDef = WEAPON_CATALOG[weaponId];
      const res = addItemToBag(saveState, weaponId, 1);
      if (!res.ok) {
        showToast(`BAG FULL (${BAG_MAX_SLOTS}/${BAG_MAX_SLOTS})! SELL ITEMS IN STORE`, '#fb7185');
        return false;
      }
      writeGameSave(saveState);
      refreshHud();
      const msg = `RARE DROP → BAG (${saveState.bagSlots.length}/${BAG_MAX_SLOTS}): ${wDef.name.toUpperCase()}!`;
      showToast(msg, '#38bdf8');
      addChatMsg('sys', 'RARE LOOT', msg, '#38bdf8');
      return true;
    },
  });

  if (def.dummy) combat.spawnTrainingDummy(def.dummy);
  if (def.heartStones?.length) combat.spawnHeartStones(def.heartStones);
  if (def.enemies?.length) combat.spawnEnemies(def.enemies);
  if (def.allies?.length) combat.spawnAllies(def.allies);

  player.setWorld(world, def.spawn, true);
  mp.setZone(worldId, activeLevelNum, player.pos, player.facingYaw);
  paused = false;
  closeAllMenus();
  levelClearOverlay.classList.add('hidden');
  gameOverOverlay.classList.add('hidden');
  toastEl.classList.add('hidden');
  npcPrompt.classList.add('hidden');
  refreshHud();

  const gDiff = getGuildDifficulty(saveState);
  if (worldId !== 'haven' && gDiff.active) {
    showToast(`${gDiff.label} — SMART AI & ELITE FOES!`, '#fb7185');
  } else if (worldId === 'arena') {
    showToast(`${def.name.toUpperCase()} — FIGHT!`, '#fda4af');
  }
}

// =========================================================================
// STORY QUESTS, PINNED TRACKER HUD, 3D WAYPOINT & UPFRONT REWARD PREVIEWS
// =========================================================================
qtLogBtn?.addEventListener('click', () => openMenu === 'quest' ? closeAllMenus() : showMenu('quest'));
qtMinBtn?.addEventListener('click', () => {
  const min = questTrackerHud.classList.toggle('minimized');
  qtMinBtn.textContent = min ? '+' : '−';
});

function renderRewardPillsHtml(q) {
  const pills = [];
  pills.push(`<span class="reward-pill">${HUD_ICONS.coin} +${q.rewardCredits} CR</span>`);
  if (q.rewardWeapon && WEAPON_CATALOG[q.rewardWeapon]) {
    const wDef = WEAPON_CATALOG[q.rewardWeapon];
    pills.push(`<span class="reward-pill">${getWeaponIcon(wDef.model, '#facc15', 13)} ${escHtml(wDef.name)}</span>`);
  }
  const extras = (q.rewardPreview || []).slice(1);
  for (const ex of extras) {
    pills.push(`<span class="reward-pill unlock">✦ ${escHtml(ex)}</span>`);
  }
  return `<div class="reward-pills">${pills.join('')}</div>`;
}

function getQuestWaypointTarget(q, done) {
  if (!q || !world) return null;

  // Ready to claim -> guide back to Quest Giver NPC in Safe Haven (or claim right from Tracker!)
  if (done) {
    if (activeWorldId === 'haven') {
      const npc = (world.friendlyNpcs || []).find((n) => n.id === q.npcId);
      if (npc) return { pos: npc.pos, label: `Talk to ${npc.name} or click CLAIM!` };
    }
    return { pos: null, label: 'Complete! Click CLAIM REWARD below!' };
  }

  // In Safe Haven: point directly to the exact Portal or NPC for this quest!
  if (activeWorldId === 'haven') {
    if (q.goalType === 'weaponsOwned') {
      const merch = (world.friendlyNpcs || []).find((n) => n.id === 'merchant');
      return { pos: merch ? merch.pos : world.shopPos, label: 'Visit Merchant Mira at the Weapon Store' };
    }
    if (q.goalType === 'gearLvl') {
      const smith = (world.friendlyNpcs || []).find((n) => n.id === 'smith');
      return { pos: smith ? smith.pos : world.shopPos, label: 'Visit Blacksmith Torin / STORE → UPGRADES' };
    }
    if (q.goalType === 'hasGuild') {
      const gm = (world.friendlyNpcs || []).find((n) => n.id === 'guildmaster');
      return { pos: gm ? gm.pos : null, label: 'Visit Guild Master Kael / click GUILD' };
    }
    if (q.goalType === 'arenaWins') {
      const arenaPt = (world.portals || []).find((p) => p.worldId === 'arena');
      return { pos: arenaPt ? arenaPt.pos : null, label: 'Enter DUEL ARENA Portal' };
    }
    // World-specific or general Combat / Relic / Boss / Chest quests -> exact matching Portal!
    const worldGoalMap = { forestLvl: 'forest', beachLvl: 'beach', desertLvl: 'desert', dungeonLvl: 'dungeon' };
    const specificW = worldGoalMap[q.goalType];
    const unlockedPortals = (world.portals || []).filter((p) => p.unlocked && p.worldId !== 'arena');
    const targetPortal = specificW
      ? (world.portals || []).find((p) => p.worldId === specificW)
      : (unlockedPortals[unlockedPortals.length - 1] || unlockedPortals[0]);
    if (targetPortal) {
      return { pos: targetPortal.pos, label: `Enter ${targetPortal.label} Portal` };
    }
    return { pos: null, label: q.waypointHint || q.desc };
  }

  // Inside an Adventure Level or Sky Arena:
  if (q.goalType === 'chests' && world.chests?.length) {
    const ch = world.chests.find((c) => !c.opened);
    if (ch) return { pos: ch.pos, label: 'Open Hidden Golden Chest!' };
  }
  if (combat) {
    // Nearest alive enemy (prioritize Boss for bossClear!)
    let best = null;
    let bestD = Infinity;
    for (const e of combat.enemies || []) {
      if (e.dead) continue;
      if (q.goalType === 'bossClear' && e.isBoss) { best = e; break; }
      const d = player.pos.distanceTo(e.pos);
      if (d < bestD) { bestD = d; best = e; }
    }
    if (best) return { pos: best.pos, label: best.isBoss ? 'Defeat Warden Boss!' : 'Defeat Guardians ahead' };
  }
  if (world.goalRelic && !world.goalRelic.collected) {
    return { pos: world.goalRelic.pos, label: world.goalRelic.sealed ? 'Defeat Guardians to unseal Relic' : 'Claim the Sky Relic!' };
  }
  return { pos: null, label: q.waypointHint || q.desc };
}

function getCompassArrow(targetPos) {
  if (!targetPos) return { hasDir: false, deg: 0, dist: '' };
  const dx = targetPos.x - player.pos.x;
  const dz = targetPos.z - player.pos.z;
  const dist = Math.round(Math.hypot(dx, dz));
  // Camera forward vector is (-sin(camYaw), -cos(camYaw)); right is (cos(camYaw), -sin(camYaw))
  const fwdX = -Math.sin(player.camYaw);
  const fwdZ = -Math.cos(player.camYaw);
  const rightX = Math.cos(player.camYaw);
  const rightZ = -Math.sin(player.camYaw);
  const localFwd = dx * fwdX + dz * fwdZ;
  const localRight = dx * rightX + dz * rightZ;
  // Smooth 360-degree angle where 0° = straight ahead (↑), +90° = right (→), 180° = behind (↓)
  const deg = Math.round(Math.atan2(localRight, localFwd) * (180 / Math.PI));
  return { hasDir: true, deg, dist: `${dist}m` };
}

let lastTrackerKey = '';
function updateQuestTracker(force = false) {
  if (!questTrackerHud || !qtBody) return;
  const showHud = started && !paused && !creatingCharacter;
  questTrackerHud.classList.toggle('hidden', !showHud);
  if (!showHud) {
    world?.setWaypoint?.(0, 0, 0, false);
    world?.setGuideArrow?.(null, null, false);
    return;
  }

  const q = getActiveTrackedQuest(saveState);
  if (!q) {
    world?.setWaypoint?.(0, 0, 0, false);
    world?.setGuideArrow?.(null, null, false);
    const key = 'none';
    if (!force && lastTrackerKey === key) return;
    lastTrackerKey = key;
    qtBody.innerHTML = `<div style="opacity:0.85;">No active quest tracked.</div><div style="font-size:10px;color:#67e8f9;margin-top:3px;">Click <b>LOG [J]</b> or talk to Safe Haven NPCs to pick a quest!</div>`;
    return;
  }

  const prog = getQuestProgress(saveState, q);
  const done = prog >= q.target;
  const pct = Math.min(100, Math.round((prog / q.target) * 100));
  const wp = getQuestWaypointTarget(q, done);

  // Update BOTH 3D Destination Waypoint Beacon & 3D Floating Overhead Guide Arrow EVERY frame at 60 FPS!
  if (wp && wp.pos) {
    world?.setWaypoint?.(wp.pos.x, wp.pos.y, wp.pos.z, true);
    world?.setGuideArrow?.(player.pos, wp.pos, true);
  } else {
    world?.setWaypoint?.(0, 0, 0, false);
    world?.setGuideArrow?.(null, null, false);
  }

  const compass = getCompassArrow(wp?.pos);
  // Smoothly update existing SVG compass arrow rotation & distance every frame without rebuilding DOM!
  const existingSvg = qtBody.querySelector('.qt-arrow-svg');
  const existingDist = qtBody.querySelector('.qt-dist-val');
  if (existingSvg && compass.hasDir) {
    existingSvg.style.transform = `rotate(${compass.deg}deg)`;
  }
  if (existingDist) {
    existingDist.textContent = compass.dist;
  }

  const key = `${q.id}|${prog}|${done}|${compass.hasDir ? 1 : 0}|${wp?.label || ''}`;
  if (!force && lastTrackerKey === key) return;
  lastTrackerKey = key;

  const arrowHtml = compass.hasDir
    ? `<svg class="qt-arrow-svg" viewBox="0 0 24 24" width="18" height="18" style="display:block;transform:rotate(${compass.deg}deg);transition:transform 0.06s linear;"><path d="M12 2L20 19L12 15L4 19Z" fill="#facc15" stroke="#0f172a" stroke-width="1.6"/></svg>`
    : `<span style="color:#34d399;font-weight:900;">★</span>`;

  qtBody.innerHTML =
    `<div style="font-weight:900;color:${done ? '#34d399' : '#facc15'};">${escHtml(q.chapter)}: ${escHtml(q.title)}</div>` +
    `<div style="font-size:10px;opacity:0.9;margin-top:2px;">${escHtml(q.desc)} <b class="${done ? 'green' : 'cyan'}">(${prog}/${q.target})</b></div>` +
    `<div class="qt-bar"><div class="qt-bar-fill" style="width:${pct}%;"></div></div>` +
    `<div class="qt-compass"><span class="qt-arrow">${arrowHtml}</span><span>${escHtml(wp?.label || q.waypointHint)}${compass.dist ? ` · <b class="gold qt-dist-val">${compass.dist}</b>` : ''}</span></div>` +
    `<div style="font-size:9px;opacity:0.75;margin-top:4px;letter-spacing:0.5px;">REWARDS:</div>` +
    renderRewardPillsHtml(q);

  if (done) {
    const claimBtn = document.createElement('button');
    claimBtn.className = 'play-cta';
    claimBtn.style.cssText = 'width:100%; padding:5px 8px; font-size:11px; margin-top:6px;';
    claimBtn.textContent = `CLAIM +${q.rewardCredits} CR!`;
    claimBtn.addEventListener('click', () => {
      claimQuestReward(q);
      updateQuestTracker(true);
    });
    qtBody.appendChild(claimBtn);
  }
}

function claimQuestReward(q) {
  if (saveState.quests.claimed.includes(q.id)) return;
  saveState.quests.claimed.push(q.id);
  addCredits(saveState, q.rewardCredits);
  let extra = '';
  if (q.rewardWeapon) {
    const res = addItemToBag(saveState, q.rewardWeapon, 1);
    if (res.ok) extra = ` + ${WEAPON_CATALOG[q.rewardWeapon].name} in Bag!`;
  }
  // Auto-pin the next active quest (or next chapter if available)
  if (saveState.trackedQuestId === q.id) {
    const nextActive = getActiveTrackedQuest(saveState);
    saveState.trackedQuestId = nextActive ? nextActive.id : null;
  }
  audio.playUpgrade();
  writeGameSave(saveState);
  refreshHud();
  updateQuestTracker(true);
  const msg = `QUEST COMPLETE: ${q.title} (+${q.rewardCredits} CR${extra})`;
  showToast(msg, '#34d399');
  addChatMsg('sys', 'QUEST', msg, '#34d399');
}

function buildQuestRow(q, onRefresh) {
  const accepted = saveState.quests.accepted.includes(q.id);
  const claimed = saveState.quests.claimed.includes(q.id);
  const prog = getQuestProgress(saveState, q);
  const done = prog >= q.target;
  const activeTracked = getActiveTrackedQuest(saveState);
  const isTracked = accepted && !claimed && activeTracked && activeTracked.id === q.id;

  const row = document.createElement('div');
  row.className = 'item-row' + ((done && accepted && !claimed) || isTracked ? ' equipped' : '');
  const left = document.createElement('div');
  left.style.flex = '1';
  left.innerHTML =
    `<b>${escHtml(q.chapter)}: ${escHtml(q.title)}</b> ` +
    (isTracked ? `<span class="cyan" style="font-size:10px;font-weight:900;">★ TRACKING</span> ` : '') +
    `<span style="opacity:0.7;">(${escHtml(q.npc)})</span><br>` +
    `<span style="font-size:10px;color:#fde68a;">"${escHtml(q.story)}"</span><br>` +
    `<span style="font-size:10px;opacity:0.9;">Goal: ${escHtml(q.desc)} <b class="${done ? 'green' : 'cyan'}">(${prog}/${q.target})</b></span>` +
    `<div style="font-size:10px;color:#bae6fd;margin-top:2px;">Wayfinder: ${escHtml(q.waypointHint || q.desc)}</div>` +
    renderRewardPillsHtml(q);

  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex; flex-direction:column; gap:4px; align-items:flex-end; flex-shrink:0;';

  const btn = document.createElement('button');
  btn.className = 'pixel-box ctrl-btn';
  if (claimed) {
    btn.textContent = 'CLAIMED ✓';
    btn.disabled = true;
  } else if (!accepted) {
    btn.textContent = 'ACCEPT';
    btn.style.color = '#38bdf8';
    btn.addEventListener('click', () => {
      saveState.quests.accepted.push(q.id);
      if (!getActiveTrackedQuest(saveState)) saveState.trackedQuestId = q.id;
      else saveState.trackedQuestId = q.id;
      writeGameSave(saveState);
      audio.playSave();
      addChatMsg('sys', 'QUEST', `Accepted & Tracking: ${q.title} (${q.desc})`, '#67e8f9');
      refreshHud();
      updateQuestTracker(true);
      onRefresh();
    });
  } else if (done) {
    btn.textContent = 'CLAIM';
    btn.style.color = '#facc15';
    btn.addEventListener('click', () => { claimQuestReward(q); onRefresh(); });
  } else {
    btn.textContent = isTracked ? '★ TRACKED' : 'TRACK';
    btn.style.color = isTracked ? '#34d399' : '#67e8f9';
    btn.disabled = isTracked;
    btn.addEventListener('click', () => {
      saveState.trackedQuestId = q.id;
      writeGameSave(saveState);
      updateQuestTracker(true);
      showToast(`TRACKING: ${q.title.toUpperCase()}`, '#38bdf8');
      onRefresh();
    });
  }
  actions.appendChild(btn);

  if (accepted && !claimed && done && !isTracked) {
    const pinBtn = document.createElement('button');
    pinBtn.className = 'pixel-box ctrl-btn';
    pinBtn.style.cssText = 'padding:3px 7px; font-size:10px; color:#67e8f9;';
    pinBtn.textContent = 'PIN';
    pinBtn.addEventListener('click', () => {
      saveState.trackedQuestId = q.id;
      writeGameSave(saveState);
      updateQuestTracker(true);
      onRefresh();
    });
    actions.appendChild(pinBtn);
  }

  row.append(left, actions);
  return row;
}

function renderQuestLog() {
  document.getElementById('storyIntroBox').innerHTML = `<b class="gold">${GAME_STORY.title}</b><br>${GAME_STORY.intro}`;
  const list = document.getElementById('questLogList');
  list.innerHTML = '';

  const active = QUEST_CATALOG.filter((q) => saveState.quests.accepted.includes(q.id) && !saveState.quests.claimed.includes(q.id));
  const avail = QUEST_CATALOG.filter((q) => !saveState.quests.accepted.includes(q.id) && !saveState.quests.claimed.includes(q.id));
  const completed = QUEST_CATALOG.filter((q) => saveState.quests.claimed.includes(q.id));

  const addSection = (title, items) => {
    if (!items.length) return;
    const h = document.createElement('div');
    h.className = 'slot-header';
    h.style.textAlign = 'left';
    h.textContent = `${title} (${items.length})`;
    list.appendChild(h);
    for (const q of items) list.appendChild(buildQuestRow(q, renderQuestLog));
  };

  addSection('ACTIVE QUESTS (CLICK TRACK TO PIN ON SCREEN)', active);
  addSection('AVAILABLE QUESTS (UPFRONT REWARDS)', avail);
  addSection('COMPLETED QUESTS', completed);
}

function renderNpcModal() {
  if (!activeNpc) return;
  document.getElementById('npcModalName').textContent = activeNpc.name.toUpperCase();
  document.getElementById('npcModalRole').textContent = activeNpc.role;
  document.getElementById('npcDialogueBox').textContent = `"${activeNpc.greeting}"`;

  const qList = document.getElementById('npcQuestList');
  qList.innerHTML = '';
  const npcQuests = QUEST_CATALOG.filter((q) => q.npcId === activeNpc.id);
  for (const q of npcQuests) {
    qList.appendChild(buildQuestRow(q, renderNpcModal));
  }

  npcActionBtn.classList.add('hidden');
  npcActionBtn.onclick = null;
  if (activeNpc.id === 'merchant') {
    npcActionBtn.textContent = 'OPEN STORE';
    npcActionBtn.classList.remove('hidden');
    npcActionBtn.onclick = () => { shopReturnAction = 'game'; setShopTab('weapons'); showMenu('shop'); };
  } else if (activeNpc.id === 'smith') {
    npcActionBtn.textContent = 'OPEN GLOW FORGE';
    npcActionBtn.classList.remove('hidden');
    npcActionBtn.onclick = () => { shopReturnAction = 'game'; setShopTab('upgrades'); showMenu('shop'); };
  } else if (activeNpc.id === 'guildmaster') {
    npcActionBtn.textContent = 'OPEN GUILDS / ALLIANCE';
    npcActionBtn.classList.remove('hidden');
    npcActionBtn.onclick = () => showMenu('guild');
  } else if (activeNpc.id === 'arenamaster') {
    npcActionBtn.textContent = 'ENTER DUEL ARENA';
    npcActionBtn.classList.remove('hidden');
    npcActionBtn.onclick = () => showMenu('arena');
  }
}

// =========================================================================
// SKY ARENA MODAL (AI PvP Challengers + Guild Hard Mode Scaling)
// =========================================================================
function renderArenaModal() {
  const el = document.getElementById('arenaContent');
  el.innerHTML = '';
  const gDiff = getGuildDifficulty(saveState);

  const info = document.createElement('div');
  info.className = 'controls-box';
  info.innerHTML =
    `<div>Arena Wins: <b class="gold">${saveState.arenaWins || 0}</b> · Best Tier Cleared: <b class="cyan">${saveState.arenaBestTier || 0}/${ARENA_TIERS.length}</b></div>` +
    (gDiff.active
      ? `<div style="margin-top:4px;color:#fda4af;font-weight:700;">⚔ ${gDiff.label} ACTIVE: AI Challengers &amp; World NPCs have +${Math.round((gDiff.hpMult - 1) * 100)}% HP, faster speed &amp; smart dodge/dash AI! (+15 Bonus CR per win + AI Guild Ally in Tier 3-4!)</div>`
      : `<div style="margin-top:4px;opacity:0.85;">Battle tactical AI NPC Players who strafe, kite, dodge projectiles &amp; dash-lunge! Join a Guild to unlock <b>Guild Hard Mode</b> &amp; an AI Guild Ally in Tier 3-4.</div>`);
  el.appendChild(info);

  const list = document.createElement('div');
  list.className = 'item-list';
  for (const t of ARENA_TIERS) {
    const row = document.createElement('div');
    row.className = 'item-row';
    const left = document.createElement('div');
    const bonusTxt = gDiff.active ? ` + 15 Guild Bonus` : '';
    left.innerHTML =
      `<b style="color:#fda4af;">TIER ${t.tier}: ${t.name}</b><br>` +
      `<span style="font-size:10px;opacity:0.85;">${t.desc}</span><br>` +
      `<span style="font-size:10px;" class="gold">Win Reward: +${t.reward} CR${bonusTxt}</span>`;
    const btn = document.createElement('button');
    btn.className = 'play-cta';
    btn.style.padding = '7px 14px';
    btn.style.fontSize = '12px';
    btn.textContent = 'FIGHT';
    btn.addEventListener('click', () => {
      audio.unlock();
      enterStage('arena', t.tier);
    });
    row.append(left, btn);
    list.appendChild(row);
  }
  el.appendChild(list);
}

// =========================================================================
// GUILDS / ALLIANCES UI (Create, Invite up to 100 Members, Ranks & Roster)
// =========================================================================
function cleanName(s, max = 16) {
  return String(s || '').replace(/[^A-Za-z0-9 _-]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}
function encodeGuildCode(prefix, obj) {
  try { return prefix + btoa(unescape(encodeURIComponent(JSON.stringify(obj)))); } catch { return ''; }
}
function decodeGuildCode(prefix, code) {
  try {
    const c = String(code || '').replace(/\s+/g, '');
    if (!c.startsWith(prefix)) return null;
    return JSON.parse(decodeURIComponent(escape(atob(c.slice(prefix.length)))));
  } catch { return null; }
}
function sameName(a, b) { return String(a || '').toLowerCase() === String(b || '').toLowerCase(); }

function normalizeGuild(g) {
  if (!g) return null;
  if (!Array.isArray(g.members)) {
    // Upgrade older saves: starter alliances stored a member count number
    const isOwn = String(g.id || '').startsWith('custom_');
    g.npcMembers = isOwn ? 0 : Math.max(0, Number(g.members) || 0);
    g.members = [{ name: saveState.playerName, role: isOwn ? 'Leader' : 'Member', joinedAt: Date.now() }];
    g.leader = isOwn ? saveState.playerName : 'Guild Master Kael';
    g.isPublic = !isOwn;
  }
  if (!Array.isArray(g.invites)) g.invites = [];
  if (!g.leader) g.leader = g.members.find((m) => m.role === 'Leader')?.name || saveState.playerName;
  if (!g.members.some((m) => sameName(m.name, saveState.playerName))) {
    g.members.push({ name: saveState.playerName, role: 'Member', joinedAt: Date.now() });
  }
  return g;
}
function guildMemberCount(g) { return (g.npcMembers || 0) + g.members.length; }
function guildSeatsUsed(g) { return guildMemberCount(g) + g.invites.length; }
function myGuildRole(g) { return g.members.find((m) => sameName(m.name, saveState.playerName))?.role || 'Member'; }

function makeGuildInviteCode(g) {
  return encodeGuildCode('SKYG-', {
    v: 1, gid: g.id, name: g.name, tag: g.tag, color: g.color, perk: g.perk,
    bonusType: g.bonusType, level: g.level || 1, leader: g.leader,
    roster: g.members.map((m) => ({ name: m.name, role: m.role })),
    invited: g.invites.map((i) => i.name),
  });
}

function guildSmallBtn(label, color, onClick) {
  const b = document.createElement('button');
  b.className = 'pixel-box ctrl-btn';
  b.style.padding = '4px 8px';
  b.style.fontSize = '10px';
  if (color) b.style.color = color;
  b.textContent = label;
  b.addEventListener('click', onClick);
  return b;
}

function saveGuildAndRender(msg, color) {
  writeGameSave(saveState);
  refreshHud();
  if (msg) showToast(msg, color || '#34d399');
  renderGuildModal();
}

function copyToClipboard(text, textareaEl) {
  if (textareaEl) { textareaEl.focus(); textareaEl.select(); }
  navigator.clipboard?.writeText(text).catch(() => {});
  try { document.execCommand && document.execCommand('copy'); } catch {}
  if (textareaEl) textareaEl.blur();
  showToast('CODE COPIED! SEND IT TO YOUR FRIEND', '#34d399');
}

function renderPlayerNameBox(el) {
  const box = document.createElement('div');
  box.className = 'controls-box';
  box.innerHTML = `<span class="section-lbl">YOUR EXPLORER NAME (friends invite you with this)</span>
    <div style="display:flex;gap:6px;flex-wrap:wrap;">
      <input id="playerNameInput" class="txt-input" style="flex:1;min-width:140px;" maxlength="16" />
      <button id="savePlayerNameBtn" class="pixel-box ctrl-btn" style="color:#34d399;">SAVE NAME</button>
    </div>`;
  el.appendChild(box);
  const inp = box.querySelector('#playerNameInput');
  inp.value = saveState.playerName || '';
  box.querySelector('#savePlayerNameBtn').addEventListener('click', () => {
    const nn = cleanName(inp.value);
    if (nn.length < 3) { showToast('NAME MUST BE 3-16 LETTERS / NUMBERS', '#fb7185'); return; }
    const old = saveState.playerName;
    if (saveState.guild) {
      const g = normalizeGuild(saveState.guild);
      if (g.members.some((m) => !sameName(m.name, old) && sameName(m.name, nn))) {
        showToast('THAT NAME IS ALREADY IN YOUR GUILD', '#fb7185');
        return;
      }
      const me = g.members.find((m) => sameName(m.name, old));
      if (me) me.name = nn;
      if (sameName(g.leader, old)) g.leader = nn;
    }
    saveState.playerName = nn;
    saveGuildAndRender(`NAME SAVED: ${nn}`);
  });
}

function renderGuildModal() {
  const el = document.getElementById('guildContent');
  el.innerHTML = '';
  renderPlayerNameBox(el);

  if (saveState.guild) {
    renderMyGuild(el, normalizeGuild(saveState.guild));
    return;
  }

  // ---------- Found Your Own Guild ----------
  const createBox = document.createElement('div');
  createBox.className = 'controls-box';
  const buffOpts = GUILD_BUFF_OPTIONS.map((o, i) => `<option value="${i}">${escHtml(o.perk)}</option>`).join('');
  createBox.innerHTML = `<span class="section-lbl">CREATE YOUR OWN GUILD (FREE · UP TO ${GUILD_MAX_MEMBERS} MEMBERS)</span>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;">
      <input id="newGuildName" class="txt-input" style="flex:1;min-width:140px;" maxlength="20" placeholder="Guild Name (e.g. Sky Knights)" />
      <input id="newGuildTag" class="txt-input" style="width:72px;text-transform:uppercase;" maxlength="4" placeholder="TAG" />
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;align-items:center;">
      <span>Guild Buff:</span>
      <select id="newGuildBuff" class="txt-input" style="flex:1;min-width:150px;">${buffOpts}</select>
      <button id="createGuildBtn" class="pixel-box ctrl-btn" style="color:#34d399;">CREATE GUILD</button>
    </div>`;
  el.appendChild(createBox);

  createBox.querySelector('#createGuildBtn').addEventListener('click', () => {
    const name = cleanName(createBox.querySelector('#newGuildName').value, 20) || 'Sky Knights';
    const tag = (cleanName(createBox.querySelector('#newGuildTag').value, 4).replace(/\s/g, '') || 'SKY').toUpperCase();
    const opt = GUILD_BUFF_OPTIONS[Number(createBox.querySelector('#newGuildBuff').value) || 0];
    saveState.guild = {
      id: 'custom_' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36),
      name, tag, color: opt.color, level: 1, donated: 0,
      perk: opt.perk, bonusType: opt.bonusType, bonusVal: opt.bonusVal,
      leader: saveState.playerName,
      members: [{ name: saveState.playerName, role: 'Leader', joinedAt: Date.now() }],
      invites: [], npcMembers: 0, isPublic: false,
    };
    audio.playUpgrade();
    addChatMsg('guild', tag, `${saveState.playerName} founded [${tag}] ${name}! Invite up to ${GUILD_MAX_MEMBERS} members.`, opt.color);
    saveGuildAndRender(`GUILD [${tag}] CREATED! NOW INVITE YOUR FRIENDS`);
  });

  // ---------- Join a Friend's Guild with an Invite Code ----------
  const joinBox = document.createElement('div');
  joinBox.className = 'controls-box';
  joinBox.innerHTML = `<span class="section-lbl">JOIN A FRIEND'S GUILD WITH AN INVITE CODE</span>
    <div style="font-size:10px;opacity:0.85;">Ask the Guild Leader to invite your Explorer Name <b class="gold">${escHtml(saveState.playerName)}</b>, then paste the code they send you.</div>
    <textarea id="joinGuildCode" class="txt-input" style="width:100%;height:46px;margin-top:4px;font-size:10px;resize:none;" placeholder="SKYG-..."></textarea>
    <button id="joinGuildCodeBtn" class="pixel-box ctrl-btn" style="margin-top:4px;color:#facc15;">JOIN GUILD</button>`;
  el.appendChild(joinBox);

  joinBox.querySelector('#joinGuildCodeBtn').addEventListener('click', () => {
    const data = decodeGuildCode('SKYG-', joinBox.querySelector('#joinGuildCode').value);
    if (!data || !data.gid || !data.name) { showToast('INVALID GUILD INVITE CODE', '#fb7185'); return; }
    const me = saveState.playerName;
    const invited = Array.isArray(data.invited) ? data.invited : [];
    const roster = Array.isArray(data.roster) ? data.roster : [];
    const alreadyIn = roster.some((m) => sameName(m?.name, me));
    if (!alreadyIn && !invited.some((n) => sameName(n, me))) {
      showToast(`NOT INVITED YET: ASK THE LEADER TO INVITE "${me}"`, '#fb7185');
      return;
    }
    const others = roster
      .map((m) => ({ name: cleanName(m?.name), role: ['Leader', 'Officer', 'Member'].includes(m?.role) ? m.role : 'Member', joinedAt: Date.now() }))
      .filter((m) => m.name && !sameName(m.name, me));
    if (!alreadyIn && others.length >= GUILD_MAX_MEMBERS) { showToast(`GUILD IS FULL (${GUILD_MAX_MEMBERS}/${GUILD_MAX_MEMBERS})`, '#fb7185'); return; }
    const opt = GUILD_BUFF_OPTIONS.find((o) => o.bonusType === data.bonusType) || GUILD_BUFF_OPTIONS[0];
    const tag = (cleanName(data.tag, 4).replace(/\s/g, '') || 'SKY').toUpperCase();
    const gName = cleanName(data.name, 20) || 'Sky Guild';
    saveState.guild = {
      id: String(data.gid).slice(0, 48),
      name: gName, tag,
      color: /^#[0-9a-fA-F]{6}$/.test(data.color || '') ? data.color : opt.color,
      level: Math.max(1, Math.min(50, Number(data.level) || 1)), donated: 0,
      perk: opt.perk, bonusType: opt.bonusType, bonusVal: opt.bonusVal,
      leader: cleanName(data.leader) || 'Leader',
      members: [...others, { name: me, role: 'Member', joinedAt: Date.now() }],
      invites: [], npcMembers: 0, isPublic: false,
      confirmCode: encodeGuildCode('SKYC-', { v: 1, gid: String(data.gid).slice(0, 48), player: me }),
    };
    audio.playUpgrade();
    addChatMsg('guild', tag, `${me} joined [${tag}] ${gName}! Buff active: ${opt.perk}`, saveState.guild.color);
    saveGuildAndRender(`JOINED [${tag}] ${gName.toUpperCase()}! SEND YOUR CONFIRMATION CODE TO THE LEADER`);
  });

  // ---------- Public NPC Alliances ----------
  const hdr = document.createElement('div');
  hdr.className = 'slot-header';
  hdr.style.textAlign = 'left';
  hdr.textContent = 'OR JOIN A PUBLIC ALLIANCE';
  el.appendChild(hdr);

  const list = document.createElement('div');
  list.className = 'item-list';
  for (const sg of STARTER_GUILDS) {
    const row = document.createElement('div');
    row.className = 'item-row';
    const left = document.createElement('div');
    left.innerHTML = `<b style="color:${sg.color};">[${sg.tag}] ${sg.name}</b> (${sg.members}/${GUILD_MAX_MEMBERS} Explorers)<br><span style="font-size:10px;opacity:0.85;">Buff: ${sg.perk}</span>`;
    const btn = document.createElement('button');
    btn.className = 'pixel-box ctrl-btn';
    btn.textContent = 'JOIN';
    btn.disabled = sg.members >= GUILD_MAX_MEMBERS;
    btn.addEventListener('click', () => {
      saveState.guild = {
        id: sg.id, name: sg.name, tag: sg.tag, color: sg.color,
        perk: sg.perk, bonusType: sg.bonusType, bonusVal: sg.bonusVal,
        level: 1, donated: 0, leader: 'Guild Master Kael',
        members: [{ name: saveState.playerName, role: 'Member', joinedAt: Date.now() }],
        invites: [], npcMembers: sg.members, isPublic: true,
      };
      audio.playUpgrade();
      addChatMsg('guild', sg.tag, `${saveState.playerName} joined [${sg.tag}] ${sg.name}! Buff active: ${sg.perk}`, sg.color);
      saveGuildAndRender(`JOINED [${sg.tag}] ${sg.name.toUpperCase()}!`);
    });
    row.append(left, btn);
    list.appendChild(row);
  }
  el.appendChild(list);
}

function renderMyGuild(el, g) {
  const lvl = g.level || 1;
  const role = myGuildRole(g);
  const isLeader = role === 'Leader' && !g.isPublic;
  const canManage = !g.isPublic && (role === 'Leader' || role === 'Officer');
  const count = guildMemberCount(g);
  const pct = Math.min(100, Math.round((count / GUILD_MAX_MEMBERS) * 100));

  // ---------- Guild Header Card ----------
  const card = document.createElement('div');
  card.className = 'controls-box';
  card.innerHTML =
    `<div style="font-size:15px;font-weight:900;color:${escHtml(g.color)};">[${escHtml(g.tag)}] ${escHtml(g.name)} · LV ${lvl}</div>` +
    `<div style="margin-top:4px;">Leader: <b class="gold">${escHtml(g.leader)}</b> · Your Rank: <b class="cyan">${escHtml(role.toUpperCase())}</b></div>` +
    `<div>Active Guild Buff: <b class="green">${escHtml(g.perk)}</b></div>` +
    `<div>Treasury Donated: <b class="gold">${g.donated || 0} CR</b> · Next Guild Level: ${lvl * 150} CR</div>` +
    `<div style="margin-top:6px;">MEMBERS: <b class="gold">${count}/${GUILD_MAX_MEMBERS}</b>` +
    (g.invites.length ? ` · Pending Invites: <b class="cyan">${g.invites.length}</b>` : '') + `</div>` +
    `<div style="height:8px;background:#1e293b;border:1px solid #475569;margin-top:3px;"><div style="height:100%;width:${pct}%;background:${escHtml(g.color)};"></div></div>`;
  el.appendChild(card);

  // ---------- New member's Join Confirmation Code ----------
  if (g.confirmCode) {
    const cBox = document.createElement('div');
    cBox.className = 'controls-box';
    cBox.style.borderColor = '#facc15';
    cBox.innerHTML = `<span class="section-lbl" style="color:#facc15;">LAST STEP: SEND THIS CONFIRMATION CODE TO ${escHtml(g.leader).toUpperCase()}</span>
      <div style="font-size:10px;opacity:0.85;">Your guild buff is already active! The leader pastes this code to add you to their roster.</div>
      <textarea id="myConfirmCode" class="txt-input" readonly style="width:100%;height:40px;margin-top:4px;font-size:10px;resize:none;"></textarea>`;
    const ta = cBox.querySelector('#myConfirmCode');
    ta.value = g.confirmCode;
    const row = document.createElement('div');
    row.style.display = 'flex'; row.style.gap = '6px'; row.style.marginTop = '4px';
    row.append(
      guildSmallBtn('COPY CODE', '#34d399', () => copyToClipboard(g.confirmCode, ta)),
      guildSmallBtn('DONE (HIDE)', null, () => { delete g.confirmCode; saveGuildAndRender(); })
    );
    cBox.appendChild(row);
    el.appendChild(cBox);
  }

  // ---------- Invite Players (Leader & Officers) ----------
  if (canManage) {
    const seatsLeft = Math.max(0, GUILD_MAX_MEMBERS - guildSeatsUsed(g));
    const inv = document.createElement('div');
    inv.className = 'controls-box';
    inv.innerHTML = `<span class="section-lbl">INVITE PLAYERS (${seatsLeft} OF ${GUILD_MAX_MEMBERS} SEATS LEFT)</span>
      <div><b class="cyan">STEP 1:</b> Type your friend's Explorer Name and press INVITE.</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
        <input id="inviteNameInput" class="txt-input" style="flex:1;min-width:140px;" maxlength="16" placeholder="Friend's Explorer Name" />
        <button id="sendInviteBtn" class="pixel-box ctrl-btn" style="color:#34d399;">INVITE</button>
      </div>
      <div style="margin-top:8px;"><b class="cyan">STEP 2:</b> Copy this Guild Invite Code and send it to them (Messenger, Discord, etc.). They paste it in <b>GUILD → JOIN WITH INVITE CODE</b>.</div>
      <textarea id="guildInviteCode" class="txt-input" readonly style="width:100%;height:44px;margin-top:4px;font-size:10px;resize:none;"></textarea>
      <button id="copyInviteBtn" class="pixel-box ctrl-btn" style="margin-top:4px;">COPY INVITE CODE</button>
      <div style="margin-top:8px;"><b class="cyan">STEP 3:</b> Paste the Confirmation Code they send back to add them to your roster.</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
        <input id="confirmCodeInput" class="txt-input" style="flex:1;min-width:140px;" placeholder="SKYC-..." />
        <button id="confirmMemberBtn" class="pixel-box ctrl-btn" style="color:#facc15;">ADD MEMBER</button>
      </div>`;
    el.appendChild(inv);

    const codeTa = inv.querySelector('#guildInviteCode');
    const inviteCode = makeGuildInviteCode(g);
    codeTa.value = inviteCode;
    inv.querySelector('#copyInviteBtn').addEventListener('click', () => copyToClipboard(inviteCode, codeTa));

    inv.querySelector('#sendInviteBtn').addEventListener('click', () => {
      const nm = cleanName(inv.querySelector('#inviteNameInput').value);
      if (nm.length < 3) { showToast('ENTER A NAME (3-16 LETTERS / NUMBERS)', '#fb7185'); return; }
      if (g.members.some((m) => sameName(m.name, nm))) { showToast(`${nm} IS ALREADY A MEMBER`, '#fb7185'); return; }
      if (g.invites.some((i) => sameName(i.name, nm))) { showToast(`${nm} IS ALREADY INVITED`, '#fb7185'); return; }
      if (guildSeatsUsed(g) >= GUILD_MAX_MEMBERS) {
        showToast(`GUILD FULL: ${GUILD_MAX_MEMBERS}/${GUILD_MAX_MEMBERS} (INCL. PENDING INVITES)`, '#fb7185');
        return;
      }
      g.invites.push({ name: nm, sentAt: Date.now(), by: saveState.playerName });
      addChatMsg('guild', g.tag, `${saveState.playerName} invited ${nm} to the guild.`, g.color);
      saveGuildAndRender(`INVITED ${nm}! NOW COPY & SEND THE INVITE CODE`);
    });

    inv.querySelector('#confirmMemberBtn').addEventListener('click', () => {
      const data = decodeGuildCode('SKYC-', inv.querySelector('#confirmCodeInput').value);
      if (!data || data.gid !== g.id) { showToast('INVALID CONFIRMATION CODE FOR THIS GUILD', '#fb7185'); return; }
      const nm = cleanName(data.player);
      if (!nm) { showToast('INVALID CONFIRMATION CODE', '#fb7185'); return; }
      if (g.members.some((m) => sameName(m.name, nm))) { showToast(`${nm} IS ALREADY A MEMBER`, '#facc15'); return; }
      const invIdx = g.invites.findIndex((i) => sameName(i.name, nm));
      if (invIdx < 0) { showToast(`${nm} WAS NOT INVITED`, '#fb7185'); return; }
      if (guildMemberCount(g) >= GUILD_MAX_MEMBERS) { showToast(`GUILD FULL (${GUILD_MAX_MEMBERS}/${GUILD_MAX_MEMBERS})`, '#fb7185'); return; }
      g.invites.splice(invIdx, 1);
      g.members.push({ name: nm, role: 'Member', joinedAt: Date.now() });
      audio.playUpgrade();
      addChatMsg('guild', g.tag, `${nm} joined the guild! (${guildMemberCount(g)}/${GUILD_MAX_MEMBERS})`, g.color);
      saveGuildAndRender(`${nm} JOINED THE GUILD!`);
    });
  } else {
    const note = document.createElement('div');
    note.className = 'controls-box';
    note.innerHTML = g.isPublic
      ? `This is a public alliance run by Guild Master Kael. <b class="gold">Create your own Guild</b> to invite friends (up to ${GUILD_MAX_MEMBERS} members).`
      : 'Only the Guild Leader and Officers can invite new members.';
    el.appendChild(note);
  }

  // ---------- Pending Invites ----------
  if (canManage && g.invites.length) {
    const ph = document.createElement('div');
    ph.className = 'slot-header';
    ph.style.textAlign = 'left';
    ph.textContent = `PENDING INVITES (${g.invites.length})`;
    el.appendChild(ph);
    const pl = document.createElement('div');
    pl.className = 'item-list';
    pl.style.maxHeight = '140px';
    pl.style.overflowY = 'auto';
    for (const iv of g.invites) {
      const row = document.createElement('div');
      row.className = 'item-row';
      const left = document.createElement('div');
      left.innerHTML = `<b class="cyan">${escHtml(iv.name)}</b> <span style="font-size:10px;opacity:0.8;">· waiting to join</span>`;
      row.append(left, guildSmallBtn('CANCEL', '#fb7185', () => {
        g.invites = g.invites.filter((x) => x !== iv);
        saveGuildAndRender(`INVITE TO ${iv.name} CANCELLED`, '#facc15');
      }));
      pl.appendChild(row);
    }
    el.appendChild(pl);
  }

  // ---------- Guild Roster ----------
  const rh = document.createElement('div');
  rh.className = 'slot-header';
  rh.style.textAlign = 'left';
  rh.textContent = `GUILD ROSTER (${count}/${GUILD_MAX_MEMBERS})`;
  el.appendChild(rh);

  const roster = document.createElement('div');
  roster.className = 'item-list';
  roster.style.maxHeight = '240px';
  roster.style.overflowY = 'auto';
  const rankOrder = { Leader: 0, Officer: 1, Member: 2 };
  const rankColor = { Leader: '#facc15', Officer: '#67e8f9', Member: '#cbd5e1' };
  const sorted = [...g.members].sort((a, b) => (rankOrder[a.role] ?? 3) - (rankOrder[b.role] ?? 3) || a.name.localeCompare(b.name));

  for (const m of sorted) {
    const isMe = sameName(m.name, saveState.playerName);
    const row = document.createElement('div');
    row.className = 'item-row' + (isMe ? ' equipped' : '');
    const left = document.createElement('div');
    left.innerHTML = `<b style="color:${rankColor[m.role] || '#cbd5e1'};">${escHtml(m.name)}${isMe ? ' (YOU)' : ''}</b><br><span style="font-size:10px;opacity:0.85;">${escHtml((m.role || 'Member').toUpperCase())}</span>`;
    const btns = document.createElement('div');
    btns.style.display = 'flex'; btns.style.gap = '4px'; btns.style.flexWrap = 'wrap'; btns.style.justifyContent = 'flex-end';

    if (isLeader && !isMe) {
      if (m.role === 'Member') {
        btns.appendChild(guildSmallBtn('PROMOTE', '#67e8f9', () => { m.role = 'Officer'; addChatMsg('guild', g.tag, `${m.name} was promoted to Officer.`, g.color); saveGuildAndRender(`${m.name} IS NOW AN OFFICER`); }));
      } else if (m.role === 'Officer') {
        btns.appendChild(guildSmallBtn('DEMOTE', '#cbd5e1', () => { m.role = 'Member'; saveGuildAndRender(`${m.name} IS NOW A MEMBER`, '#facc15'); }));
      }
      btns.appendChild(guildSmallBtn('MAKE LEADER', '#facc15', () => {
        if (!confirm(`Make ${m.name} the new Guild Leader? You will become an Officer.`)) return;
        const me = g.members.find((x) => sameName(x.name, saveState.playerName));
        if (me) me.role = 'Officer';
        m.role = 'Leader';
        g.leader = m.name;
        addChatMsg('guild', g.tag, `${m.name} is the new Guild Leader!`, g.color);
        saveGuildAndRender(`${m.name} IS THE NEW GUILD LEADER`, '#facc15');
      }));
    }
    const officerCanKick = role === 'Officer' && !g.isPublic && m.role === 'Member';
    if (!isMe && (isLeader || officerCanKick)) {
      btns.appendChild(guildSmallBtn('KICK', '#fb7185', () => {
        if (!confirm(`Remove ${m.name} from the guild?`)) return;
        g.members = g.members.filter((x) => x !== m);
        addChatMsg('guild', g.tag, `${m.name} was removed from the guild.`, g.color);
        saveGuildAndRender(`${m.name} REMOVED`, '#facc15');
      }));
    }
    row.append(left, btns);
    roster.appendChild(row);
  }
  if (g.npcMembers) {
    const row = document.createElement('div');
    row.className = 'item-row empty-slot';
    row.textContent = `+ ${g.npcMembers} other public alliance explorers`;
    roster.appendChild(row);
  }
  el.appendChild(roster);

  // ---------- Donate / Leave / Disband ----------
  const row = document.createElement('div');
  row.style.display = 'flex'; row.style.gap = '8px'; row.style.justifyContent = 'center'; row.style.flexWrap = 'wrap';
  const donBtn = document.createElement('button');
  donBtn.className = 'play-cta';
  donBtn.style.padding = '8px 16px'; donBtn.style.fontSize = '12px';
  donBtn.textContent = 'DONATE 50 CR';
  donBtn.disabled = saveState.credits < 50;
  donBtn.addEventListener('click', () => {
    if (saveState.credits < 50) return;
    addCredits(saveState, -50);
    g.donated = (g.donated || 0) + 50;
    if (g.donated >= lvl * 150) {
      g.level = lvl + 1;
      addChatMsg('guild', g.tag, `${g.name} leveled up to LV ${g.level}! Guild buff strengthened!`, g.color);
    }
    audio.playUpgrade();
    saveGuildAndRender();
  });

  const leaveBtn = document.createElement('button');
  leaveBtn.className = 'pixel-box ctrl-btn';
  leaveBtn.style.color = '#fb7185';
  leaveBtn.textContent = isLeader ? 'DISBAND GUILD' : 'LEAVE GUILD';
  leaveBtn.addEventListener('click', () => {
    if (isLeader && g.members.length > 1) {
      if (!confirm(`Disband [${g.tag}] ${g.name}? Tip: use MAKE LEADER on a member first if you want the guild to continue without you.`)) return;
    } else if (!confirm(isLeader ? `Disband [${g.tag}] ${g.name}?` : `Leave [${g.tag}] ${g.name}?`)) {
      return;
    }
    addChatMsg('guild', g.tag, isLeader ? `[${g.tag}] ${g.name} was disbanded.` : `${saveState.playerName} left the guild.`, g.color);
    saveState.guild = null;
    saveGuildAndRender(isLeader ? 'GUILD DISBANDED' : 'YOU LEFT THE GUILD', '#facc15');
  });
  row.append(donBtn, leaveBtn);
  el.appendChild(row);

  const foot = document.createElement('p');
  foot.style.fontSize = '10px';
  foot.style.opacity = '0.75';
  foot.textContent = 'Offline mode: invites travel by code. When online servers launch, invites will pop up in-game instantly.';
  el.appendChild(foot);
}

// =========================================================================
// CHARACTER CUSTOMIZER & PRE-GAME HERO CREATOR UI
// =========================================================================
const RANDOM_HERO_NAMES = ['SkyWalker', 'CloudKnight', 'AeroBlade', 'StarStrider', 'Zephyr', 'NovaWing', 'StormFox', 'Solaris', 'Valen', 'AriaSky'];

function renderAvatarPanel(resetNameInput = false) {
  const av = saveState.avatar;
  const titleEl = document.getElementById('avatarTitle');
  const subEl = document.getElementById('avatarSubtitle');
  const nameInp = document.getElementById('heroNameInput');
  if (titleEl) titleEl.textContent = creatingCharacter ? 'CREATE YOUR HERO' : 'CHARACTER DESIGN';
  if (subEl) subEl.textContent = creatingCharacter
    ? 'Build your Hero Name & Style before entering the skies!'
    : 'Customize your Hero Name & 3D look anytime.';
  closeAvatarBtn.textContent = creatingCharacter ? 'ENTER WORLD →' : 'SAVE & BACK';
  if (resetNameInput && nameInp) {
    nameInp.value = saveState.playerName || '';
  }

  const makeSwatches = (elId, items, key) => {
    const el = document.getElementById(elId);
    el.innerHTML = '';
    for (const item of items) {
      const b = document.createElement('button');
      b.className = 'swatch-btn' + (av[key] === item.id ? ' active' : '');
      b.style.background = item.hex;
      b.title = item.name;
      b.addEventListener('click', () => { av[key] = item.id; player.refreshAvatarVisuals(); writeGameSave(saveState); renderAvatarPanel(); });
      el.appendChild(b);
    }
  };
  const makeChips = (elId, items, key) => {
    const el = document.getElementById(elId);
    el.innerHTML = '';
    for (const item of items) {
      const b = document.createElement('button');
      b.className = 'chip-btn' + (av[key] === item.id ? ' active' : '');
      b.textContent = item.name;
      b.addEventListener('click', () => { av[key] = item.id; player.refreshAvatarVisuals(); writeGameSave(saveState); renderAvatarPanel(); });
      el.appendChild(b);
    }
  };
  makeSwatches('avSkinRow', AVATAR_OPTIONS.skin, 'skin');
  makeChips('avEmotionRow', AVATAR_OPTIONS.emotion, 'emotion');
  makeChips('avHairStyleRow', AVATAR_OPTIONS.hairStyle, 'hairStyle');
  makeSwatches('avHairColorRow', AVATAR_OPTIONS.hairColor, 'hairColor');
  makeChips('avBeardRow', AVATAR_OPTIONS.beard, 'beard');
  makeChips('avOutfitRow', AVATAR_OPTIONS.outfit, 'outfit');
}

// =========================================================================
// 15-SLOT CHARACTER BAG UI (With Pixel Icons!)
// =========================================================================
function renderBagPanel() {
  bagSummary.textContent = `BAG SLOTS: ${saveState.bagSlots.length}/${BAG_MAX_SLOTS} · Armor Lv${saveState.armorLevel} (${getGlowTier(saveState.armorLevel).name}) · STR ${saveState.stats.str} · STA ${saveState.stats.sta} · SPD ${saveState.stats.spd}`;

  bagArrowRow.innerHTML = '';
  for (const ar of ARROW_TYPES) {
    if (!saveState.arrowsOwned[ar.id]) continue;
    const b = document.createElement('button');
    b.className = 'pixel-box ctrl-btn' + (saveState.equippedArrow === ar.id ? ' active' : '');
    b.innerHTML = `${getWeaponIcon('arrow', ar.hex, 16)}<span>${ar.name}</span>`;
    b.addEventListener('click', () => { saveState.equippedArrow = ar.id; writeGameSave(saveState); renderBagPanel(); });
    bagArrowRow.appendChild(b);
  }

  bagList.innerHTML = '';
  for (let i = 0; i < BAG_MAX_SLOTS; i++) {
    const item = saveState.bagSlots[i];
    if (!item) {
      const empty = document.createElement('div');
      empty.className = 'item-row empty-slot';
      empty.textContent = `SLOT ${i + 1} · [ EMPTY ]`;
      bagList.appendChild(empty);
      continue;
    }

    const def = WEAPON_CATALOG[item.weaponId];
    const glow = getGlowTier(item.level || 1);
    const dmg = getItemDamage(saveState, item);
    const isEq = saveState.equippedUid === item.uid;
    const sellPrice = getItemSellPrice(item);

    const row = document.createElement('div');
    row.className = 'item-row' + (isEq ? ' equipped' : '');
    const left = document.createElement('div');
    left.className = 'item-row-left';
    left.innerHTML = `${getWeaponIcon(def.model, glow.hex, 26)}<div><span class="glow-dot" style="background:${glow.hex};"></span><b>${def.name}</b> Lv${item.level} <span class="cyan">${dmg} DMG</span><br><span style="font-size:10px;opacity:0.75;">Slot ${i + 1} · ${def.slot} · ${glow.name} Glow</span></div>`;

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '5px';

    const eqBtn = document.createElement('button');
    eqBtn.className = 'pixel-box ctrl-btn';
    eqBtn.textContent = isEq ? 'EQUIPPED' : 'EQUIP';
    eqBtn.disabled = isEq;
    eqBtn.addEventListener('click', () => {
      saveState.equippedUid = item.uid;
      player.refreshGearVisuals();
      writeGameSave(saveState);
      refreshHud();
      renderBagPanel();
    });
    actions.appendChild(eqBtn);

    if (!item.locked && sellPrice > 0) {
      const sellBtn = document.createElement('button');
      sellBtn.className = 'pixel-box ctrl-btn';
      sellBtn.style.color = '#facc15';
      sellBtn.textContent = `SELL +${sellPrice}`;
      sellBtn.addEventListener('click', () => {
        sellBagItem(saveState, item.uid);
        audio.playCoin();
        player.refreshGearVisuals();
        writeGameSave(saveState);
        refreshHud();
        renderBagPanel();
      });
      actions.appendChild(sellBtn);
    }

    row.append(left, actions);
    bagList.appendChild(row);
  }
}

// =========================================================================
// 4-TAB SLOTTED STORE (With Pixel Icons!)
// =========================================================================
function setShopTab(tab) {
  shopTab = tab;
  tabWeapons.classList.toggle('active', tab === 'weapons');
  tabUpgrades.classList.toggle('active', tab === 'upgrades');
  tabSell.classList.toggle('active', tab === 'sell');
  tabCredits.classList.toggle('active', tab === 'credits');
  renderShopPanel();
}
tabWeapons.addEventListener('click', () => setShopTab('weapons'));
tabUpgrades.addEventListener('click', () => setShopTab('upgrades'));
tabSell.addEventListener('click', () => setShopTab('sell'));
tabCredits.addEventListener('click', () => setShopTab('credits'));

function renderShopPanel() {
  shopCredits.textContent = String(saveState.credits);
  shopBagCount.textContent = `${saveState.bagSlots.length}/${BAG_MAX_SLOTS}`;
  shopTabContent.innerHTML = '';

  const addHeader = (text) => {
    const h = document.createElement('div');
    h.className = 'slot-header';
    h.textContent = text;
    shopTabContent.appendChild(h);
  };

  const addRow = (iconHtml, html, btnText, disabled, onClick, btnColor = '') => {
    const row = document.createElement('div');
    row.className = 'item-row';
    const left = document.createElement('div');
    left.className = 'item-row-left';
    left.innerHTML = `${iconHtml}<div>${html}</div>`;
    const btn = document.createElement('button');
    btn.className = 'pixel-box ctrl-btn';
    if (btnColor) btn.style.color = btnColor;
    btn.textContent = btnText;
    btn.disabled = disabled;
    if (!disabled && onClick) btn.addEventListener('click', onClick);
    row.append(left, btn);
    shopTabContent.appendChild(row);
  };

  if (shopTab === 'weapons') {
    const slotsOrder = ['Knife', 'Dagger', 'Bow', 'Spear', 'Sword', 'Battle Axe'];
    for (const slotName of slotsOrder) {
      addHeader(`${slotName} Slot`);
      for (const id of WEAPON_IDS) {
        const def = WEAPON_CATALOG[id];
        if (def.slot !== slotName) continue;
        const canAfford = saveState.credits >= def.buyCost;
        const bagFull = saveState.bagSlots.length >= BAG_MAX_SLOTS;
        const tintHex = '#' + (def.tint || 0xe2e8f0).toString(16).padStart(6, '0');
        addRow(
          getWeaponIcon(def.model, tintHex, 26),
          `<b>${def.name}</b> · <span class="cyan">${def.baseDamage} BASE DMG</span><br><span style="font-size:10px;opacity:0.78;">${def.desc}</span>`,
          bagFull ? 'BAG FULL' : `${def.buyCost} CR`,
          bagFull || !canAfford,
          () => {
            if (saveState.credits < def.buyCost) return;
            const res = addItemToBag(saveState, id, 1);
            if (!res.ok) return;
            addCredits(saveState, -def.buyCost);
            audio.playUpgrade();
            writeGameSave(saveState);
            refreshHud();
            renderShopPanel();
            showToast(`BOUGHT ${def.name.toUpperCase()} → STORED IN BAG!`, '#34d399');
          },
          canAfford && !bagFull ? '#facc15' : ''
        );
      }

      if (slotName === 'Bow') {
        addHeader('Arrows Slot (Bow Ammo Upgrades)');
        for (const ar of ARROW_TYPES) {
          if (ar.cost === 0) continue;
          const owned = !!saveState.arrowsOwned[ar.id];
          const eq = saveState.equippedArrow === ar.id;
          const canAfford = saveState.credits >= ar.cost;
          addRow(
            getWeaponIcon('arrow', ar.hex, 26),
            `<span class="glow-dot" style="background:${ar.hex};"></span><b>${ar.name}</b><br><span style="font-size:10px;opacity:0.78;">${ar.desc}</span>`,
            owned ? (eq ? 'EQUIPPED' : 'EQUIP') : `${ar.cost} CR`,
            owned ? eq : !canAfford,
            () => {
              if (!owned) {
                if (saveState.credits < ar.cost) return;
                addCredits(saveState, -ar.cost);
                saveState.arrowsOwned[ar.id] = true;
                audio.playUpgrade();
              }
              saveState.equippedArrow = ar.id;
              writeGameSave(saveState);
              refreshHud();
              renderShopPanel();
            },
            !owned && canAfford ? '#facc15' : ''
          );
        }
      }
    }
  } else if (shopTab === 'upgrades') {
    addHeader('Armor Slot (Visible 3D Plate & Glow)');
    const aLvl = saveState.armorLevel;
    const aCost = getArmorUpgradeCost(aLvl);
    const nextAGlow = getGlowTier(aLvl + 1);
    addRow(
      HUD_ICONS.armor,
      `<span class="glow-dot" style="background:${nextAGlow.hex};"></span><b>Character Armor</b> (Lv${aLvl} → Lv${Math.min(6, aLvl + 1)} ${nextAGlow.name} Glow)<br><span style="font-size:10px;opacity:0.78;">Visible 3D armor pieces + glow + shield protection</span>`,
      aLvl >= 6 ? 'MAX' : `${aCost} CR`,
      aLvl >= 6 || saveState.credits < aCost,
      () => {
        addCredits(saveState, -aCost);
        saveState.armorLevel = Math.min(6, aLvl + 1);
        audio.playUpgrade();
        player.refreshGearVisuals();
        player.healFull();
        writeGameSave(saveState);
        refreshHud();
        renderShopPanel();
      }
    );

    addHeader('Character Stat Slots (STR · STA · SPD)');
    for (const [k, label, desc] of [
      ['str', 'Strength (STR)', '+22% Damage across all weapons'],
      ['sta', 'Stamina (STA)', 'Faster Air-Dash recovery'],
      ['spd', 'Speed (SPD)', 'Faster movement across floating islands'],
    ]) {
      const sl = saveState.stats[k];
      const cost = getStatUpgradeCost(sl);
      addRow(
        HUD_ICONS.quest,
        `<b>${label}</b> Lv${sl} → Lv${sl + 1}<br><span style="font-size:10px;opacity:0.78;">${desc}</span>`,
        sl >= 10 ? 'MAX' : `${cost} CR`,
        sl >= 10 || saveState.credits < cost,
        () => {
          addCredits(saveState, -cost);
          saveState.stats[k] = sl + 1;
          audio.playUpgrade();
          writeGameSave(saveState);
          refreshHud();
          renderShopPanel();
        }
      );
    }

    addHeader('Individual Weapon Upgrade Slots (Your Bag)');
    for (const item of saveState.bagSlots) {
      const def = WEAPON_CATALOG[item.weaponId];
      const wLvl = item.level || 1;
      const wCost = getWeaponUpgradeCost(wLvl);
      const nextGlow = getGlowTier(wLvl + 1);
      addRow(
        getWeaponIcon(def.model, nextGlow.hex, 26),
        `<span class="glow-dot" style="background:${nextGlow.hex};"></span><b>${def.name}</b> (Lv${wLvl} → Lv${Math.min(6, wLvl + 1)} ${nextGlow.name} Glow)<br><span style="font-size:10px;opacity:0.78;">Current: ${getItemDamage(saveState, item)} DMG · ${def.slot}</span>`,
        wLvl >= 6 ? 'MAX' : `${wCost} CR`,
        wLvl >= 6 || saveState.credits < wCost,
        () => {
          addCredits(saveState, -wCost);
          item.level = Math.min(6, wLvl + 1);
          audio.playUpgrade();
          player.refreshGearVisuals();
          writeGameSave(saveState);
          refreshHud();
          renderShopPanel();
        }
      );
    }
  } else if (shopTab === 'sell') {
    addHeader(`Sell Extra Bag Items (${saveState.bagSlots.length}/${BAG_MAX_SLOTS} Slots)`);
    const sellable = saveState.bagSlots.filter((it) => !it.locked && getItemSellPrice(it) > 0);
    if (sellable.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'item-row empty-slot';
      empty.textContent = 'No sellable loot in your Bag yet!';
      shopTabContent.appendChild(empty);
    } else {
      for (const item of sellable) {
        const def = WEAPON_CATALOG[item.weaponId];
        const glow = getGlowTier(item.level || 1);
        const payout = getItemSellPrice(item);
        addRow(
          getWeaponIcon(def.model, glow.hex, 26),
          `<span class="glow-dot" style="background:${glow.hex};"></span><b>${def.name}</b> Lv${item.level} ${saveState.equippedUid === item.uid ? '<span class="gold">(EQUIPPED)</span>' : ''}<br><span style="font-size:10px;opacity:0.78;">${def.slot} · Fair Merchant Buyback</span>`,
          `SELL +${payout} CR`,
          false,
          () => {
            sellBagItem(saveState, item.uid);
            audio.playCoin();
            player.refreshGearVisuals();
            writeGameSave(saveState);
            refreshHud();
            renderShopPanel();
          },
          '#facc15'
        );
      }
    }
  } else if (shopTab === 'credits') {
    addHeader('Credit Packs (Online Store Preview)');
    for (const pack of [
      { name: 'Starter Pouch',     cr: '250 CR',   desc: 'Unlock a Knife, Dagger, or Bow right away' },
      { name: 'Adventurer Chest',  cr: '1,000 CR', desc: 'Upgrade Armor & Weapons to Emerald / Gold Glow' },
      { name: 'Sky King Vault',    cr: '3,500 CR', desc: 'Collect Sunblade, Titan Waraxe & Mythic Glows' },
    ]) {
      addRow(HUD_ICONS.coin, `<b class="gold">${pack.name} — ${pack.cr}</b><br><span style="font-size:10px;opacity:0.78;">${pack.desc}</span>`, 'ONLINE SOON', true, null);
    }
  }
}

// =========================================================================
// OWNER-ONLY ADMIN PANEL
// =========================================================================
function refreshAdminButtons() {
  if (!IS_OWNER_BUILD) return;
  document.getElementById('admGodMode').textContent = saveState.godMode ? 'GOD MODE: ON' : 'GOD MODE: OFF';
  document.getElementById('admPreviewAll').textContent = saveState.previewAll ? 'UNLOCK ALL LVLS: ON' : 'UNLOCK ALL LVLS: OFF';
}

if (IS_OWNER_BUILD) {
  adminMenuBtn.addEventListener('click', () => showMenu('admin'));
  closeAdminBtn.addEventListener('click', () => showMenu('option'));
  document.getElementById('admAdd500').addEventListener('click', () => { addCredits(saveState, 500); writeGameSave(saveState); refreshHud(); audio.playCoin(); showToast('ADMIN: +500 CREDITS', '#facc15'); });
  document.getElementById('admAdd5000').addEventListener('click', () => { addCredits(saveState, 5000); writeGameSave(saveState); refreshHud(); audio.playCoin(); showToast('ADMIN: +5,000 CREDITS', '#facc15'); });
  document.getElementById('admGodMode').addEventListener('click', () => { saveState.godMode = !saveState.godMode; writeGameSave(saveState); refreshAdminButtons(); });
  document.getElementById('admPreviewAll').addEventListener('click', () => {
    saveState.previewAll = !saveState.previewAll; writeGameSave(saveState); refreshAdminButtons();
    if (activeWorldId === 'haven') enterStage('haven', 0);
  });
  document.getElementById('admMaxGlow').addEventListener('click', () => {
    getEquippedItem(saveState).level = 6;
    saveState.armorLevel = 6;
    player.refreshGearVisuals(); player.healFull(); writeGameSave(saveState); refreshHud(); audio.playUpgrade();
    showToast('ADMIN: MAX LV6 MYTHIC GLOW!', '#fb7185');
  });
  document.getElementById('admGiveGear').addEventListener('click', () => {
    for (const id of ['knife', 'bow', 'spear', 'sunblade', 'titan_axe']) addItemToBag(saveState, id, 3);
    saveState.arrowsOwned.lightning = true; saveState.equippedArrow = 'lightning';
    writeGameSave(saveState); refreshHud(); audio.playChestOpen();
    showToast(`ADMIN: RARE GEAR ADDED (${saveState.bagSlots.length}/${BAG_MAX_SLOTS})`, '#38bdf8');
  });
  document.getElementById('admOpenStore').addEventListener('click', () => {
    shopReturnAction = 'option'; shopTitle.textContent = 'LEVEL 10 MERCHANT STORE (PREVIEW)';
    shopSubtitle.textContent = 'Testing the automatic 10th-level Pop-Up Store!'; closeShopBtn.textContent = 'BACK';
    setShopTab('weapons'); showMenu('shop');
  });
}

// =========================================================================
// 5 WORLDS & SEQUENTIAL LEVEL SELECTOR
// =========================================================================
function renderWorldsPanel() {
  worldsList.innerHTML = '';
  if (IS_OWNER_BUILD) {
    previewToggleBtn.classList.remove('hidden');
    previewToggleBtn.textContent = saveState.previewAll ? 'PREVIEW ALL: ON' : 'PREVIEW ALL: OFF';
  }
  const havenRow = document.createElement('div');
  havenRow.className = 'world-card';
  havenRow.innerHTML = `<div><b class="gold">SAFE HAVEN (CLOUD CITADEL)</b><br><span style="font-size:10px;opacity:0.8;">Portals · Quest NPCs · Store · Guilds · Save Crystal</span></div>`;
  const hBtn = document.createElement('button');
  hBtn.className = 'pixel-box ctrl-btn'; hBtn.textContent = 'ENTER';
  hBtn.addEventListener('click', () => enterStage('haven', 0));
  havenRow.appendChild(hBtn);
  worldsList.appendChild(havenRow);

  for (const wId of WORLD_ORDER) {
    const meta = WORLD_META[wId];
    const unlocked = !!(saveState.unlockedWorlds[wId] || (IS_OWNER_BUILD && saveState.previewAll));
    const maxL = (IS_OWNER_BUILD && saveState.previewAll) ? 100 : (saveState.maxLevel[wId] || 1);
    const card = document.createElement('div');
    card.className = 'world-card';
    const info = document.createElement('div');
    info.innerHTML = `<b style="color:${meta.accent};">${meta.order}. ${meta.name.toUpperCase()}</b><br><span style="font-size:10px;opacity:0.8;">${unlocked ? `Unlocked: Lv 1–${maxL} / 100` : 'Locked (Clear previous world Lv 100)'}</span>`;
    const controls = document.createElement('div');
    controls.style.display = 'flex'; controls.style.gap = '6px'; controls.style.alignItems = 'center';
    if (unlocked) {
      const inp = document.createElement('input');
      inp.type = 'number'; inp.min = '1'; inp.max = String(maxL);
      inp.value = String(saveState.maxLevel[wId] || 1); inp.className = 'lvl-input';
      const goBtn = document.createElement('button');
      goBtn.className = 'pixel-box ctrl-btn'; goBtn.textContent = 'PLAY';
      goBtn.addEventListener('click', () => enterStage(wId, Math.max(1, Math.min(maxL, parseInt(inp.value, 10) || 1))));
      controls.append(inp, goBtn);
    } else {
      const lockBtn = document.createElement('button');
      lockBtn.className = 'pixel-box ctrl-btn'; lockBtn.textContent = 'LOCKED'; lockBtn.disabled = true;
      controls.appendChild(lockBtn);
    }
    card.append(info, controls);
    worldsList.appendChild(card);
  }
}

// =========================================================================
// MULTI-CONTROL MODES & KEY REMAPPER
// =========================================================================
const KEYS_STORAGE = 'skybound_relics_keybinds_v3';
const PRESETS = {
  wasd:   { forward: 'KeyW', back: 'KeyS', left: 'KeyA', right: 'KeyD', jump: 'Space', attack: 'KeyF', dash: 'ShiftLeft', swap: 'Tab', talk: 'KeyT', camLeft: 'KeyQ', camRight: 'KeyE', respawn: 'KeyR' },
  arrows: { forward: 'ArrowUp', back: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', jump: 'KeyZ', attack: 'KeyC', dash: 'KeyX', swap: 'Tab', talk: 'KeyT', camLeft: 'KeyA', camRight: 'KeyD', respawn: 'KeyR' },
};
const ACTION_LABELS = [
  ['forward', 'Move Forward'], ['back', 'Move Backward'], ['left', 'Move Left'], ['right', 'Move Right'],
  ['jump', 'Jump / 2x Jump'], ['attack', 'Auto-Aim Attack'], ['dash', 'Air-Dash'], ['swap', 'Next Bag Weapon'],
  ['talk', 'Talk to NPC'], ['camLeft', 'Camera Left'], ['camRight', 'Camera Right'], ['respawn', 'Respawn'],
];

function formatKeyCode(code) {
  if (!code) return '---';
  if (code === 'Space') return 'Space';
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Arrow')) return code.slice(5);
  if (code === 'ShiftLeft' || code === 'ShiftRight') return 'Shift';
  return code;
}

let keybinds = (() => {
  try {
    const s = JSON.parse(localStorage.getItem(KEYS_STORAGE));
    if (s && typeof s === 'object') return { ...PRESETS.wasd, ...s };
  } catch {}
  return { ...PRESETS.wasd };
})();
let listeningAction = null;

const CTRL_MODES = ['keyboard', 'buttons', 'drag', 'gamepad'];
const CAM_MODES = ['mouselook', 'autofollow', 'manual'];
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
let inputMode = isTouchDevice ? 'buttons' : 'keyboard';
let camMode = isTouchDevice ? 'autofollow' : 'mouselook';
let autoCamPauseTimer = 0;

function lockCsPointer() {
  try {
    if (!canvas.requestPointerLock) return;
    const p = canvas.requestPointerLock();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch {}
}

function updateCsAimUi() {
  const activePlay = started && !paused && !openMenu && !creatingCharacter;
  if (!csCrosshair) return;

  if (!activePlay || camMode !== 'mouselook') {
    csCrosshair.classList.add('hidden');
    csCrosshair.classList.remove('locked');
    return;
  }

  // True 3rd-Person Shooter Crosshair: fixed cleanly in open space over your hero's right shoulder (50%, 38%)!
  // Casts a live 3D ray straight through the green cross -> turns bright red-gold when aimed onto an enemy!
  const onEnemy = combat ? combat.updateCrosshairAim(camera, player, 0, 0.24, 38) : null;
  csCrosshair.style.left = '50%';
  csCrosshair.style.top = '38%';
  csCrosshair.classList.remove('hidden');
  csCrosshair.classList.toggle('locked', !!onEnemy);
}

function applyAutoAimUi() {
  if (!autoAimBtn) return;
  const on = saveState.autoAim !== false;
  autoAimBtn.textContent = on ? 'AUTO-AIM: ON' : 'AUTO-AIM: OFF';
  autoAimBtn.style.color = on ? '#34d399' : '#facc15';
}
applyAutoAimUi();

function applyCamMode() {
  camModeBtn.textContent =
    camMode === 'mouselook' ? 'CAM: MOUSE AIM'
    : camMode === 'autofollow' ? 'CAM: AUTO-FOLLOW'
    : 'CAM: MANUAL';
  if (camMode !== 'mouselook' && document.pointerLockElement === canvas) {
    document.exitPointerLock?.();
  }
  updateCsAimUi();
  if (openMenu === 'option') updateControlsSummary();
}
applyCamMode();

// Live Xbox & PlayStation Controller State (Plug-and-Play via HTML5 Gamepad API!)
const gamepadState = {
  connected: false,
  brand: 'Xbox / PlayStation',
  id: '',
  prevButtons: [],
};

function detectGamepadBrand(id = '') {
  const s = String(id).toLowerCase();
  if (s.includes('dualsense') || s.includes('dualshock') || s.includes('playstation') || s.includes('sony') || s.includes('054c')) {
    return 'PlayStation';
  }
  if (s.includes('xbox') || s.includes('xinput') || s.includes('045e') || s.includes('microsoft')) {
    return 'Xbox';
  }
  return 'Controller';
}

window.addEventListener('gamepadconnected', (e) => {
  const gp = e.gamepad;
  gamepadState.connected = true;
  gamepadState.id = gp?.id || 'Gamepad';
  gamepadState.brand = detectGamepadBrand(gamepadState.id);
  gamepadState.prevButtons = [];
  if (openMenu === 'option') updateControlsSummary();
  showToast(`${gamepadState.brand.toUpperCase()} CONTROLLER CONNECTED!`, '#34d399');
  addChatMsg('sys', 'CONTROLLER', `${gamepadState.brand} Controller connected! Left Stick: Move · Right Stick: Cam · A/✕: Jump · X/□/RT: Attack · B/○: Dash`, '#34d399');
});
window.addEventListener('gamepaddisconnected', () => {
  const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
  if (pads.length === 0) {
    gamepadState.connected = false;
    gamepadState.id = '';
    gamepadState.prevButtons = [];
    if (openMenu === 'option') updateControlsSummary();
    showToast('CONTROLLER DISCONNECTED', '#facc15');
  }
});

function applyInputMode() {
  document.body.classList.remove('mode-keyboard', 'mode-buttons', 'mode-drag', 'mode-gamepad');
  document.body.classList.add(`mode-${inputMode}`);
  inputModeBtn.textContent =
    inputMode === 'keyboard' ? 'CTRL: KEYBOARD & MOUSE'
    : inputMode === 'buttons' ? 'CTRL: BUTTONS'
    : inputMode === 'drag' ? 'CTRL: DRAG'
    : 'CTRL: XBOX / PS';
  if (openMenu === 'option') updateControlsSummary();
}
applyInputMode();

function saveBinds() { try { localStorage.setItem(KEYS_STORAGE, JSON.stringify(keybinds)); } catch {} }

function updateControlsSummary() {
  const f = formatKeyCode;
  const gpStatus = gamepadState.connected
    ? `<span class="green">CONNECTED (${escHtml(gamepadState.brand)})</span>`
    : `<span style="opacity:0.8;">Plug in Xbox / PS Controller &amp; press any button</span>`;

  if (inputMode === 'gamepad') {
    controlsSummary.innerHTML =
      `<b>Controller Status:</b> ${gpStatus}<br />` +
      `<b>Move:</b> Left Stick · <b>Camera:</b> Right Stick · <b>Zoom:</b> D-Pad Up/Down<br />` +
      `<b>Jump:</b> A / ✕ · <b>Auto-Aim Attack:</b> X / □ / RT / R2 · <b>Dash:</b> B / ○ / RB / R1<br />` +
      `<b>Talk NPC / Swap:</b> Y / △ / LB / L1 · <b>Menu:</b> Start / Options · <b>Bag:</b> View / Share<br />` +
      `<b>Stats:</b> STR ${saveState.stats.str} · STA ${saveState.stats.sta} · SPD ${saveState.stats.spd} · Armor Lv${saveState.armorLevel}` +
      (saveState.guild ? ` · Guild [${saveState.guild.tag}]` : '');
  } else {
    controlsSummary.innerHTML =
      `<b>Keyboard &amp; Mouse:</b> ${f(keybinds.forward)}/${f(keybinds.left)}/${f(keybinds.back)}/${f(keybinds.right)} Move &amp; Strafe · <b>Mouse:</b> 360° Aim (Click game to lock, <b>Esc/Tab</b> to free cursor)<br />` +
      `<b>Left-Click / ${f(keybinds.attack)}:</b> Attack · <b>Right-Click / ${f(keybinds.dash)}:</b> Dash · <b>${f(keybinds.jump)}:</b> Jump · <b>${f(keybinds.talk)}:</b> Talk · <b>J:</b> Quest Log · <b>Scroll:</b> Zoom<br />` +
      `<b>Xbox / PlayStation Controller:</b> ${gpStatus}<br />` +
      `<b>Stats:</b> STR ${saveState.stats.str} · STA ${saveState.stats.sta} · SPD ${saveState.stats.spd} · Armor Lv${saveState.armorLevel}` +
      (saveState.guild ? ` · Guild [${saveState.guild.tag}]` : '');
  }
  presetWasd.classList.toggle('active', keybinds.forward === PRESETS.wasd.forward);
  presetArrows.classList.toggle('active', keybinds.forward === PRESETS.arrows.forward);
}

function renderBindGrid() {
  bindGrid.innerHTML = '';
  for (const [action, label] of ACTION_LABELS) {
    const lbl = document.createElement('span'); lbl.textContent = label;
    const btn = document.createElement('button');
    btn.className = 'bind-key' + (listeningAction === action ? ' listening' : '');
    btn.textContent = listeningAction === action ? 'PRESS KEY...' : formatKeyCode(keybinds[action]);
    btn.addEventListener('click', () => { listeningAction = listeningAction === action ? null : action; renderBindGrid(); });
    bindGrid.append(lbl, btn);
  }
}

function cycleBagWeapon() {
  if (saveState.bagSlots.length <= 1) return;
  const idx = saveState.bagSlots.findIndex((it) => it.uid === saveState.equippedUid);
  const next = saveState.bagSlots[(idx + 1) % saveState.bagSlots.length];
  saveState.equippedUid = next.uid;
  player.refreshGearVisuals(); writeGameSave(saveState); refreshHud();
  showToast(`EQUIPPED: ${WEAPON_CATALOG[next.weaponId].name.toUpperCase()} Lv${next.level}`, getGlowTier(next.level).hex);
}

// Wire On-Screen Clickable HUD Buttons + Modals
hudBagBtn.addEventListener('click', () => openMenu === 'bag' ? closeAllMenus() : showMenu('bag'));
hudStoreBtn.addEventListener('click', () => {
  if (openMenu === 'shop') { closeAllMenus(); return; }
  shopReturnAction = 'game';
  shopTitle.textContent = 'UPGRADE STORE';
  shopSubtitle.textContent = 'Browse Weapons, Arrows, Upgrades, or Sell Bag items!';
  closeShopBtn.textContent = 'CLOSE';
  setShopTab('weapons');
  showMenu('shop');
});
hudQuestBtn.addEventListener('click', () => openMenu === 'quest' ? closeAllMenus() : showMenu('quest'));
hudGuildBtn.addEventListener('click', () => openMenu === 'guild' ? closeAllMenus() : showMenu('guild'));
hudArenaBtn.addEventListener('click', () => openMenu === 'arena' ? closeAllMenus() : showMenu('arena'));
optionBtn.addEventListener('click', () => openMenu === 'option' ? closeAllMenus() : showMenu('option'));
resumeBtn.addEventListener('click', closeAllMenus);
closeBagBtn.addEventListener('click', closeAllMenus);
closeQuestBtn.addEventListener('click', closeAllMenus);
closeGuildBtn.addEventListener('click', closeAllMenus);
closeArenaBtn.addEventListener('click', closeAllMenus);
closeNpcBtn.addEventListener('click', closeAllMenus);

npcPrompt.addEventListener('click', () => {
  if (!nearbyNpc) return;
  activeNpc = nearbyNpc;
  showMenu('npc');
});

avatarBtn.addEventListener('click', () => { creatingCharacter = false; player.facingYaw = 0; showMenu('avatar'); });
document.getElementById('randomNameBtn')?.addEventListener('click', () => {
  const base = RANDOM_HERO_NAMES[Math.floor(Math.random() * RANDOM_HERO_NAMES.length)];
  const pick = base + Math.floor(10 + Math.random() * 89);
  const inp = document.getElementById('heroNameInput');
  if (inp) inp.value = pick;
});
document.getElementById('randomStyleBtn')?.addEventListener('click', () => {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)].id;
  saveState.avatar.skin = pick(AVATAR_OPTIONS.skin);
  saveState.avatar.emotion = pick(AVATAR_OPTIONS.emotion);
  saveState.avatar.hairStyle = pick(AVATAR_OPTIONS.hairStyle);
  saveState.avatar.hairColor = pick(AVATAR_OPTIONS.hairColor);
  saveState.avatar.beard = pick(AVATAR_OPTIONS.beard);
  saveState.avatar.outfit = pick(AVATAR_OPTIONS.outfit);
  player.refreshAvatarVisuals();
  writeGameSave(saveState);
  renderAvatarPanel();
});
closeAvatarBtn.addEventListener('click', () => {
  const inp = document.getElementById('heroNameInput');
  const nn = cleanName(inp ? inp.value : saveState.playerName, 16);
  if (nn.length < 3) {
    showToast('ENTER A HERO NAME (3-16 LETTERS / NUMBERS)', '#fb7185');
    inp?.focus();
    return;
  }
  const old = saveState.playerName;
  if (saveState.guild && !sameName(old, nn)) {
    const g = normalizeGuild(saveState.guild);
    if (!g.members.some((m) => !sameName(m.name, old) && sameName(m.name, nn))) {
      const me = g.members.find((m) => sameName(m.name, old));
      if (me) me.name = nn;
      if (sameName(g.leader, old)) g.leader = nn;
    }
  }
  saveState.playerName = nn;
  saveState.characterCreated = true;
  writeGameSave(saveState);
  if (creatingCharacter) {
    creatingCharacter = false;
    started = true;
    player.camYaw = 0;
    player.camPitch = 0.22;
    player.facingYaw = Math.PI;
    closeAllMenus();
    hudTop.classList.remove('hidden');
    chatWrap.classList.remove('hidden');
    mobileControls.classList.remove('hidden');
    audio.playUpgrade();
    addChatMsg('sys', 'WELCOME', `${nn} entered Cloud Safe Haven! Talk to Elder Rowan to start your quest.`, '#34d399');
    if (!saveState.tutorialSeen) {
      showMenu('tutorial');
    } else {
      if (camMode === 'mouselook' && !isTouchDevice) lockCsPointer();
      updateCsAimUi();
      showToast(`WELCOME, ${nn.toUpperCase()}!`, '#34d399');
    }
  } else {
    showMenu('option');
  }
});
document.getElementById('rotAvLeftBtn')?.addEventListener('click', () => { player.facingYaw -= 0.65; });
document.getElementById('rotAvRightBtn')?.addEventListener('click', () => { player.facingYaw += 0.65; });

closeShopBtn.addEventListener('click', () => {
  if (shopReturnAction === 'nextLevel') {
    if (activeLevelNum < 100) enterStage(activeWorldId, activeLevelNum + 1);
    else enterStage('haven', 0);
  } else if (shopReturnAction === 'option') {
    showMenu('option');
  } else {
    player.shopCooldown = 2.8;
    player.portalCooldown = 1.6;
    closeAllMenus();
  }
});

worldsBtn.addEventListener('click', () => showMenu('worlds'));
closeWorldsBtn.addEventListener('click', () => showMenu('option'));
previewToggleBtn.addEventListener('click', () => {
  if (!IS_OWNER_BUILD) return;
  saveState.previewAll = !saveState.previewAll;
  writeGameSave(saveState);
  renderWorldsPanel();
  if (activeWorldId === 'haven') enterStage('haven', 0);
});
saveMenuBtn.addEventListener('click', () => showMenu('save'));
closeSaveBtn.addEventListener('click', () => showMenu('option'));
saveNowBtn.addEventListener('click', () => { writeGameSave(saveState); audio.playSave(); saveStatus.textContent = `Saved! (${new Date().toLocaleTimeString()})`; });
exportSaveBtn.addEventListener('click', () => {
  const code = exportSaveCode(saveState);
  saveCodeBox.value = code;
  navigator.clipboard?.writeText(code).catch(() => {});
  saveStatus.textContent = 'Save code generated!';
});
importSaveBtn.addEventListener('click', () => {
  const loaded = importSaveCode(saveCodeBox.value);
  if (!loaded) { saveStatus.textContent = 'Invalid save code.'; return; }
  Object.assign(saveState, loaded);
  if (!IS_OWNER_BUILD) { saveState.previewAll = false; saveState.godMode = false; }
  player.refreshGearVisuals();
  enterStage(saveState.currentWorld || 'haven', saveState.lastLevel || 1);
  showToast('SAVE LOADED!', '#34d399');
});
resetSaveBtn.addEventListener('click', () => {
  Object.assign(saveState, createDefaultSave());
  writeGameSave(saveState);
  player.refreshGearVisuals();
  enterStage('haven', 0);
  started = false;
  creatingCharacter = true;
  hudTop.classList.add('hidden');
  chatWrap.classList.add('hidden');
  mobileControls.classList.add('hidden');
  player.facingYaw = 0;
  showMenu('avatar');
  showToast('NEW SAVE — BUILD YOUR HERO!', '#facc15');
});
havenBtn.addEventListener('click', () => enterStage('haven', 0));

inputModeBtn.addEventListener('click', () => { inputMode = CTRL_MODES[(CTRL_MODES.indexOf(inputMode) + 1) % CTRL_MODES.length]; applyInputMode(); });
camModeBtn.addEventListener('click', () => {
  camMode = CAM_MODES[(CAM_MODES.indexOf(camMode) + 1) % CAM_MODES.length];
  applyCamMode();
});
autoAimBtn?.addEventListener('click', () => {
  saveState.autoAim = !(saveState.autoAim !== false);
  writeGameSave(saveState);
  applyAutoAimUi();
  showToast(saveState.autoAim ? 'AUTO-AIM: ON' : 'AUTO-AIM: OFF (MANUAL AIM)', saveState.autoAim ? '#34d399' : '#facc15');
});
keysBtn.addEventListener('click', () => showMenu('keys'));
closeKeysBtn.addEventListener('click', () => showMenu('option'));
presetWasd.addEventListener('click', () => { keybinds = { ...PRESETS.wasd }; saveBinds(); updateControlsSummary(); renderBindGrid(); });
presetArrows.addEventListener('click', () => { keybinds = { ...PRESETS.arrows }; saveBinds(); updateControlsSummary(); renderBindGrid(); });
presetReset.addEventListener('click', () => { keybinds = { ...PRESETS.wasd }; saveBinds(); updateControlsSummary(); renderBindGrid(); });

pixelModeBtn.addEventListener('click', () => { retroPixelMode = !retroPixelMode; pixelModeBtn.textContent = retroPixelMode ? 'PIXELS: RETRO' : 'PIXELS: CRISP HD'; updateResolution(); });
bgmBtn.addEventListener('click', () => { bgmBtn.textContent = audio.toggleBgm() ? 'BGM: ON' : 'BGM: OFF'; });
muteBtn.addEventListener('click', () => { muteBtn.textContent = audio.toggleMute() ? 'SFX: OFF' : 'SFX: ON'; });

startBtn.addEventListener('click', () => {
  audio.unlock();
  startOverlay.classList.add('hidden');
  if (!saveState.characterCreated) {
    // First-time player: launch live 3D Hero Creator (Name + Style) BEFORE entering the game!
    creatingCharacter = true;
    started = false;
    player.facingYaw = 0;
    showMenu('avatar');
    return;
  }
  started = true;
  player.camYaw = 0;
  player.camPitch = 0.22;
  hudTop.classList.remove('hidden');
  chatWrap.classList.remove('hidden');
  mobileControls.classList.remove('hidden');
  if (!saveState.tutorialSeen) {
    showMenu('tutorial');
  } else {
    if (camMode === 'mouselook' && !isTouchDevice) lockCsPointer();
    updateCsAimUi();
  }
});

tutorialBtn?.addEventListener('click', () => showMenu('tutorial'));
closeTutorialBtn?.addEventListener('click', () => {
  saveState.tutorialSeen = true;
  writeGameSave(saveState);
  closeAllMenus();
  if (camMode === 'mouselook' && !isTouchDevice) lockCsPointer();
  updateCsAimUi();
  showToast(`WELCOME, ${(saveState.playerName || 'EXPLORER').toUpperCase()}!`, '#34d399');
});

nextLevelBtn.addEventListener('click', () => {
  audio.unlock();
  if (activeWorldId === 'arena') {
    enterStage('arena', Math.min(ARENA_TIERS.length, activeLevelNum + 1));
    return;
  }
  if (activeLevelNum < 100) enterStage(activeWorldId, activeLevelNum + 1);
  else enterStage('haven', 0);
});
clearHavenBtn.addEventListener('click', () => enterStage('haven', 0));
retryBtn.addEventListener('click', () => enterStage(activeWorldId, activeLevelNum));
goHavenBtn.addEventListener('click', () => enterStage('haven', 0));

// =========================================================================
// KEYBOARD + MOUSE WHEEL ZOOM + MULTI-TOUCH ISOLATED CONTROLS
// =========================================================================
const keys = new Set();
const touchStick = { x: 0, y: 0, activeId: null, originX: 0, originY: 0 };
const buttonPointerIds = new Set();
let camPointerId = null;
let dragMoved = 0;
let lastPointerX = 0;
let lastPointerY = 0;
let camDist = 10.6;
let targetCamDist = 10.6;

canvas.addEventListener('wheel', (e) => {
  if (!started || paused || openMenu) return;
  e.preventDefault();
  targetCamDist = Math.max(3.4, Math.min(18.0, targetCamDist + Math.sign(e.deltaY) * 1.1));
}, { passive: false });

function matchesBind(code, action) {
  const b = keybinds[action];
  if (code === b) return true;
  if ((b === 'ShiftLeft' || b === 'ShiftRight') && (code === 'ShiftLeft' || code === 'ShiftRight')) return true;
  return false;
}

window.addEventListener('keydown', (e) => {
  // Ignore gameplay shortcuts while typing in Chat or Guild input!
  if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    if (e.code === 'Escape') document.activeElement.blur();
    return;
  }

  const code = e.code;
  if (listeningAction) {
    e.preventDefault();
    if (code !== 'Escape') { keybinds[listeningAction] = code; saveBinds(); updateControlsSummary(); }
    listeningAction = null;
    renderBindGrid();
    return;
  }
  if (code === 'KeyJ' && started && !paused && !creatingCharacter) {
    e.preventDefault();
    if (openMenu === 'quest') closeAllMenus();
    else showMenu('quest');
    return;
  }
  if (code === 'Tab' && started && !paused && !openMenu && !creatingCharacter) {
    e.preventDefault();
    if (document.pointerLockElement === canvas) document.exitPointerLock?.();
    else if (camMode === 'mouselook') lockCsPointer();
    updateCsAimUi();
    return;
  }
  if (code === 'Escape' && started && !paused && !creatingCharacter) {
    // If Esc just unlocked Counter-Strike mouse cursor, don't pop open OPTION on the same keypress!
    if (performance.now() - lastPointerUnlockAt < 250) return;
    if (openMenu && openMenu !== 'option') { closeAllMenus(); return; }
    if (openMenu === 'option') { closeAllMenus(); return; }
    showMenu('option');
    return;
  }
  if (!started && !creatingCharacter && (code === 'Enter' || code === 'Space')) { e.preventDefault(); startBtn.click(); return; }
  if (!started || paused || openMenu) return;
  audio.unlock();
  if (['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) e.preventDefault();
  if (!keys.has(code)) {
    if (matchesBind(code, 'jump') || (keybinds.jump !== 'Space' && code === 'Space')) player.requestJump();
    if (matchesBind(code, 'attack')) player.requestAttack(combat);
    if (matchesBind(code, 'dash')) player.requestDash();
    if (matchesBind(code, 'swap')) cycleBagWeapon();
    if (matchesBind(code, 'talk') && nearbyNpc) { activeNpc = nearbyNpc; showMenu('npc'); }
    if (matchesBind(code, 'respawn')) player.respawn(false);
    if (code === 'Equal' || code === 'NumpadAdd') targetCamDist = Math.max(3.4, targetCamDist - 1.5);
    if (code === 'Minus' || code === 'NumpadSubtract') targetCamDist = Math.min(18.0, targetCamDist + 1.5);
  }
  keys.add(code);
});
window.addEventListener('keyup', (e) => keys.delete(e.code));

// =========================================================================
// COUNTER-STRIKE STYLE MOUSE CONTROLS (Raw 360° Pointer Lock + Crosshair!)
// =========================================================================
const hoverMouse = { hasPrev: false, x: 0, y: 0, nx: 0.5, overCanvas: false };
let lastPointerUnlockAt = 0;

document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement !== canvas) {
    lastPointerUnlockAt = performance.now();
  }
  updateCsAimUi();
});

canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('pointerleave', () => {
  hoverMouse.hasPrev = false;
  hoverMouse.overCanvas = false;
});

canvas.addEventListener('pointerdown', (e) => {
  if (document.activeElement && document.activeElement !== document.body && document.activeElement.blur) {
    document.activeElement.blur();
  }
  if (!started || paused || openMenu || e.target !== canvas) return;
  if (e.pointerId === touchStick.activeId || buttonPointerIds.has(e.pointerId)) return;
  audio.unlock();

  if (e.pointerType === 'mouse') {
    if (camMode === 'mouselook') {
      // Counter-Strike mode: clicking the canvas locks raw mouse immediately; once locked, Left-Click = Attack, Right-Click = Dash!
      if (document.pointerLockElement !== canvas) {
        lockCsPointer();
        if (e.button === 0) player.requestAttack(combat);
        return;
      }
      if (e.button === 0) player.requestAttack(combat);
      else if (e.button === 2) player.requestDash();
      return;
    }
    if (e.button === 0) {
      if (camMode === 'manual') {
        camPointerId = e.pointerId;
        dragMoved = 0;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
      } else {
        player.requestAttack(combat);
      }
      return;
    }
  }

  // Touch camera drag (when Manual cam mode is chosen on mobile)
  if (e.pointerType === 'touch' && camMode !== 'manual') return;
  if (camPointerId !== null) return;
  camPointerId = e.pointerId;
  dragMoved = 0;
  lastPointerX = e.clientX;
  lastPointerY = e.clientY;
});

window.addEventListener('pointermove', (e) => {
  // 1. TRUE COUNTER-STRIKE RAW 360° MOUSE LOOK (Zero latency, infinite 360° turn!)
  if (document.pointerLockElement === canvas && started && !paused && !openMenu) {
    const sens = 0.0028;
    player.camYaw -= (e.movementX || 0) * sens;
    player.camPitch = Math.max(-0.08, Math.min(1.05, player.camPitch + (e.movementY || 0) * (sens * 0.78)));
    player.facingYaw = player.camYaw + Math.PI;
    autoCamPauseTimer = 1.6;
    return;
  }

  // 2. Manual drag camera fallback (touch / manual mode)
  if (camPointerId === null || e.pointerId !== camPointerId) return;
  const dx = e.clientX - lastPointerX;
  const dy = e.clientY - lastPointerY;
  dragMoved += Math.abs(dx) + Math.abs(dy);
  lastPointerX = e.clientX;
  lastPointerY = e.clientY;
  player.camYaw -= dx * 0.0065;
  player.camPitch = Math.max(-0.08, Math.min(1.05, player.camPitch + dy * 0.0045));
  autoCamPauseTimer = 1.4;
});

function releaseCam(e) {
  if (camPointerId === null || e.pointerId !== camPointerId) return;
  if (dragMoved < 8 && e.pointerType === 'mouse' && e.button === 0 && started && !paused && !openMenu) {
    player.requestAttack(combat);
  }
  camPointerId = null;
}
window.addEventListener('pointerup', releaseCam);
window.addEventListener('pointercancel', releaseCam);

// Touch Joystick & Drag-Steer
const stickZone = document.getElementById('stickZone');
const stickKnob = document.getElementById('stickKnob');
stickZone.addEventListener('pointerdown', (e) => {
  e.preventDefault(); e.stopPropagation(); audio.unlock();
  if (touchStick.activeId !== null) return;
  touchStick.activeId = e.pointerId;
  const r = stickZone.getBoundingClientRect();
  touchStick.originX = r.left + r.width / 2;
  touchStick.originY = r.top + r.height / 2;
  stickZone.setPointerCapture(e.pointerId);
});
stickZone.addEventListener('pointermove', (e) => {
  if (e.pointerId !== touchStick.activeId) return;
  e.preventDefault(); e.stopPropagation();
  const maxR = 38;
  const dx = e.clientX - touchStick.originX;
  const dy = e.clientY - touchStick.originY;
  const clamped = Math.min(maxR, Math.hypot(dx, dy));
  const ang = Math.atan2(dy, dx);
  stickKnob.style.transform = `translate(${Math.cos(ang) * clamped}px, ${Math.sin(ang) * clamped}px)`;
  touchStick.x = (Math.cos(ang) * clamped) / maxR;
  touchStick.y = -(Math.sin(ang) * clamped) / maxR;
});
function releaseStick(e) {
  if (e.pointerId !== touchStick.activeId) return;
  touchStick.activeId = null;
  touchStick.x = 0; touchStick.y = 0;
  stickKnob.style.transform = 'translate(0px, 0px)';
  dragIndicator.style.display = 'none';
}
stickZone.addEventListener('pointerup', releaseStick);
stickZone.addEventListener('pointercancel', releaseStick);

dragPad.addEventListener('pointerdown', (e) => {
  if (!started || paused || openMenu || inputMode !== 'drag') return;
  e.preventDefault(); e.stopPropagation(); audio.unlock();
  if (touchStick.activeId !== null) return;
  touchStick.activeId = e.pointerId;
  touchStick.originX = e.clientX;
  touchStick.originY = e.clientY;
  dragIndicator.style.left = `${e.clientX}px`;
  dragIndicator.style.top = `${e.clientY}px`;
  dragIndicator.style.display = 'block';
  dragPad.setPointerCapture(e.pointerId);
});
dragPad.addEventListener('pointermove', (e) => {
  if (e.pointerId !== touchStick.activeId) return;
  e.preventDefault();
  const maxR = 48;
  const dx = e.clientX - touchStick.originX;
  const dy = e.clientY - touchStick.originY;
  const clamped = Math.min(maxR, Math.hypot(dx, dy));
  const ang = Math.atan2(dy, dx);
  touchStick.x = (Math.cos(ang) * clamped) / maxR;
  touchStick.y = -(Math.sin(ang) * clamped) / maxR;
});
dragPad.addEventListener('pointerup', releaseStick);
dragPad.addEventListener('pointercancel', releaseStick);

function bindTouchAction(el, fn) {
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation();
    buttonPointerIds.add(e.pointerId);
    audio.unlock();
    fn();
  });
  const clear = (e) => buttonPointerIds.delete(e.pointerId);
  el.addEventListener('pointerup', clear);
  el.addEventListener('pointercancel', clear);
}
bindTouchAction(document.getElementById('btnJump'), () => player.requestJump());
bindTouchAction(document.getElementById('btnAttack'), () => player.requestAttack(combat));
bindTouchAction(document.getElementById('btnDash'), () => player.requestDash());

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// Boot into 48x48 Safe Haven!
enterStage('haven', 0);

// =========================================================================
// MAIN LOOP
// =========================================================================
let lastTime = performance.now();
const camTarget = new THREE.Vector3();
const camDesired = new THREE.Vector3();

// Poll Xbox / PlayStation Gamepad each frame (standard HTML5 Gamepad API)
function pollGamepad(dt) {
  const out = { moveX: 0, moveY: 0, camX: 0, camY: 0 };
  if (!navigator.getGamepads) return out;
  const pads = navigator.getGamepads();
  let gp = null;
  for (let i = 0; i < pads.length; i++) {
    if (pads[i] && pads[i].connected) { gp = pads[i]; break; }
  }
  if (!gp) return out;

  if (!gamepadState.connected) {
    gamepadState.connected = true;
    gamepadState.id = gp.id || 'Gamepad';
    gamepadState.brand = detectGamepadBrand(gamepadState.id);
  }

  const dead = 0.18;
  const ax = (idx) => {
    const v = gp.axes?.[idx] || 0;
    return Math.abs(v) < dead ? 0 : (v - Math.sign(v) * dead) / (1 - dead);
  };
  const pressed = (idx) => {
    const b = gp.buttons?.[idx];
    return !!(b && (b.pressed || b.value > 0.45));
  };
  const justPressed = (idx) => pressed(idx) && !gamepadState.prevButtons[idx];

  // Global Menu / Start buttons (work even on Title Screen or Menus!)
  if (!started && !creatingCharacter && (justPressed(0) || justPressed(9))) {
    startBtn.click();
  } else if (started && !paused && !creatingCharacter) {
    if (justPressed(9)) { // Start / Options
      if (openMenu) closeAllMenus();
      else showMenu('option');
    } else if (justPressed(8)) { // Back / View / Share -> Bag
      if (openMenu === 'bag') closeAllMenus();
      else showMenu('bag');
    } else if (openMenu && justPressed(1)) { // B / Circle closes modal
      closeAllMenus();
    } else if (!openMenu) {
      out.moveX = ax(0);
      out.moveY = -ax(1);
      out.camX = ax(2);
      out.camY = ax(3);

      // D-Pad Zoom & Weapon Swap
      if (pressed(12)) targetCamDist = Math.max(3.4, targetCamDist - 7.5 * dt); // D-Up: Zoom In
      if (pressed(13)) targetCamDist = Math.min(18.0, targetCamDist + 7.5 * dt); // D-Down: Zoom Out
      if (justPressed(14) || justPressed(15) || justPressed(4)) cycleBagWeapon(); // D-Left/Right or LB/L1

      // Face Buttons & Triggers (Xbox / PlayStation standard layout)
      if (justPressed(0)) { audio.unlock(); player.requestJump(); } // A / Cross
      if (justPressed(2) || justPressed(7)) { audio.unlock(); player.requestAttack(combat); } // X / Square / RT / R2
      if (justPressed(1) || justPressed(5)) { audio.unlock(); player.requestDash(); } // B / Circle / RB / R1
      if (justPressed(3)) { // Y / Triangle -> Talk NPC or Swap Bag Weapon
        if (nearbyNpc) { activeNpc = nearbyNpc; showMenu('npc'); }
        else cycleBagWeapon();
      }
    }
  }

  gamepadState.prevButtons = gp.buttons ? gp.buttons.map((b) => !!(b && (b.pressed || b.value > 0.45))) : [];
  return out;
}

const heroScreenProj = new THREE.Vector3();

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  elapsed += dt;

  if (world) world.update(dt, elapsed, player ? player.pos : null);
  mp.update(dt, elapsed, player, activeWorldId, activeLevelNum);

  const gpInput = pollGamepad(dt);

  if (started && !paused && !openMenu) {
    let moveX = touchStick.x + gpInput.moveX;
    let moveY = touchStick.y + gpInput.moveY;
    const isDown = (action) => [...keys].some((c) => matchesBind(c, action));
    if (isDown('left')) moveX -= 1;
    if (isDown('right')) moveX += 1;
    if (isDown('forward')) moveY += 1;
    if (isDown('back')) moveY -= 1;

    const rotLeft = isDown('camLeft');
    const rotRight = isDown('camRight');
    if (Math.abs(gpInput.camX) > 0.01 || Math.abs(gpInput.camY) > 0.01) {
      player.camYaw -= gpInput.camX * 2.5 * dt;
      player.camPitch = Math.max(-0.08, Math.min(1.05, player.camPitch + gpInput.camY * 1.5 * dt));
      autoCamPauseTimer = 1.4;
    }
    if (rotLeft || rotRight) autoCamPauseTimer = 1.4;
    if (autoCamPauseTimer > 0) autoCamPauseTimer = Math.max(0, autoCamPauseTimer - dt);

    const csLocked = document.pointerLockElement === canvas && camMode === 'mouselook';
    player.update(dt, elapsed, { moveX, moveY, rotLeft, rotRight, csLook: csLocked });
    updateCsAimUi();
    updateQuestTracker(false);

    // Check nearby Talkable NPC in Safe Haven
    nearbyNpc = player.getNearbyNpc();
    if (nearbyNpc) {
      npcPrompt.textContent = `[${formatKeyCode(keybinds.talk)}] TALK TO ${nearbyNpc.name.toUpperCase()} (${nearbyNpc.role})`;
      npcPrompt.classList.remove('hidden');
    } else {
      npcPrompt.classList.add('hidden');
    }

    if (camMode === 'autofollow' && autoCamPauseTimer <= 0 && camPointerId === null) {
      if (Math.hypot(moveX, moveY) > 0.15 && moveY > -0.65) {
        const targetYaw = player.facingYaw + Math.PI;
        const diff = Math.atan2(Math.sin(targetYaw - player.camYaw), Math.cos(targetYaw - player.camYaw));
        player.camYaw += diff * Math.min(1, dt * 2.8);
      }
    }

    if (combat) combat.update(dt, elapsed, player);
  } else {
    npcPrompt.classList.add('hidden');
    if (paused && document.pointerLockElement === canvas) document.exitPointerLock?.();
    updateCsAimUi();
    updateQuestTracker(false);
    if (!started) player.camYaw = Math.sin(elapsed * 0.28) * 0.55;
  }

  if (openMenu === 'avatar') {
    const previewY = !started ? 0.008 : player.pos.y;
    player.group.position.set(player.pos.x, previewY, player.pos.z);
    player.group.rotation.y = player.facingYaw;
    player.group.visible = true;
    // Fixed front-left showcase camera so TURN buttons smoothly spin your 3D hero 360 degrees!
    camDesired.set(player.pos.x + 1.05, previewY + 1.55, player.pos.z + 3.25);
    camera.position.lerp(camDesired, Math.min(1, dt * 8));
    camTarget.set(player.pos.x + 0.52, previewY + 1.0, player.pos.z);
    camera.lookAt(camTarget);
  } else {
    camDist += (targetCamDist - camDist) * Math.min(1, dt * 10);
    const horizDist = camDist * Math.cos(player.camPitch);
    const closeFactor = Math.max(0, 1 - (camDist - 3.4) / 6.8);
    // TRUE FORTNITE / PUBG OVER-THE-SHOULDER CAMERA (scales proportionally with zoom so hero ALWAYS stays on the left third, 100% clear of the green cross!)
    const useOts = started && camMode === 'mouselook';
    const shoulder = useOts ? Math.max(1.25, camDist * 0.26) : 0;
    const rightX = Math.cos(player.camYaw) * shoulder;
    const rightZ = -Math.sin(player.camYaw) * shoulder;
    const lookFwd = useOts ? 18.0 : 0;
    const fwdX = -Math.sin(player.camYaw) * lookFwd;
    const fwdZ = -Math.cos(player.camYaw) * lookFwd;

    camDesired.set(
      player.pos.x + Math.sin(player.camYaw) * horizDist + rightX,
      player.pos.y + (useOts ? 2.15 : 2.35 - closeFactor * 0.75) + Math.sin(player.camPitch) * camDist,
      player.pos.z + Math.cos(player.camYaw) * horizDist + rightZ
    );
    // Smooth Castle Cathedral Ceiling Clearance (keeps full roof visible overhead with zero camera clipping!)
    const cb = world?.castleInteriorBounds;
    if (cb && player.pos.x > cb.minX && player.pos.x < cb.maxX && player.pos.z > cb.minZ && player.pos.z < cb.maxZ) {
      camDesired.y = Math.min(camDesired.y, cb.ceilingY - 2.6);
      camDesired.x = Math.max(cb.minX + 1.5, Math.min(cb.maxX - 1.5, camDesired.x));
      camDesired.z = Math.max(cb.minZ + 1.5, Math.min(cb.maxZ + 3.0, camDesired.z));
    }
    camera.position.lerp(camDesired, Math.min(1, dt * 14));
    camTarget.set(
      player.pos.x + rightX + fwdX,
      player.pos.y + (useOts ? 1.95 : 1.1) - Math.sin(player.camPitch) * (useOts ? 14.0 : 0),
      player.pos.z + rightZ + fwdZ
    );
    camera.lookAt(camTarget);
    if (started && !paused && !openMenu) updateCsAimUi();
  }

  // Animate Procedural Sky Dome, Sun/Moon, Twinkling Stars & Volumetric Cloud Deck!
  skyDome.update(dt, elapsed, player.pos);

  // Keep crisp directional sunlight & shadow frustum centered around the player across giant islands!
  sun.position.set(player.pos.x + 34, player.pos.y + 56, player.pos.z + 26);
  sun.target.position.copy(player.pos);
  sun.target.updateMatrixWorld();

  renderer.render(scene, camera);
}

mp.init();
requestAnimationFrame(animate);
