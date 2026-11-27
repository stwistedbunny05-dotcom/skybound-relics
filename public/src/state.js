// Persistent Save Game, 5-World Progression, 15-Slot Character Bag, Balanced Economy & Glow Tiers

export const SAVE_KEY = 'skybound_relics_rpg_save_v4';
export const BAG_MAX_SLOTS = 15;

export const WORLD_ORDER = ['forest', 'beach', 'desert', 'dungeon'];

export const WORLD_META = {
  haven:   { id: 'haven',   name: 'Safe Haven',  short: 'HAVEN',   order: 0, sky: '#7cc9ff', fog: '#a8dcff', accent: '#facc15' },
  forest:  { id: 'forest',  name: 'Sky Forest',  short: 'FOREST',  order: 1, sky: '#63beff', fog: '#94d5ff', accent: '#34d399' },
  beach:   { id: 'beach',   name: 'Sky Beach',   short: 'BEACH',   order: 2, sky: '#38bdf8', fog: '#7dd3fc', accent: '#22d3ee' },
  desert:  { id: 'desert',  name: 'Sky Desert',  short: 'DESERT',  order: 3, sky: '#f59e56', fog: '#f8be86', accent: '#fb923c' },
  dungeon: { id: 'dungeon', name: 'Sky Dungeon', short: 'DUNGEON', order: 4, sky: '#2a2244', fog: '#48396e', accent: '#c084fc' },
  arena:   { id: 'arena',   name: 'Duel Arena',  short: 'ARENA',   order: 5, sky: '#3c1e5a', fog: '#6d3c96', accent: '#f43f5e' },
};

// AI-Driven NPC Explorers (roam Cloud Safe Haven AND fight as smart PvP Challengers in Sky Arena!)
export const AI_PLAYER_PROFILES = [
  { name: 'Kaelen',   tag: 'SKY', tunic: 0x2563eb, cape: 0xf43f5e, skin: 0xffd1a9, hair: 0x5c3a21, hatColor: 0xf59e0b, weapon: 'sword',        weaponLvl: 2, style: 'melee' },
  { name: 'Lyra',     tag: 'EMR', tunic: 0x15803d, cape: 0x854d0e, skin: 0xffe4cc, hair: 0xf5c542, hatColor: 0x22c55e, weapon: 'bow',          weaponLvl: 3, style: 'ranged' },
  { name: 'Ryker',    tag: 'SUN', tunic: 0xd97706, cape: 0xfef08a, skin: 0xe0ac69, hair: 0x1e1b24, hatColor: 0xf97316, weapon: 'axe',          weaponLvl: 3, style: 'melee' },
  { name: 'Nyx',      tag: 'VOD', tunic: 0x334155, cape: 0x7e22ce, skin: 0xc68642, hair: 0xa855f7, hatColor: 0x6b21a8, weapon: 'kunai',        weaponLvl: 4, style: 'ranged' },
  { name: 'Sora',     tag: 'SKY', tunic: 0x0284c7, cape: 0xf8fafc, skin: 0xffd1a9, hair: 0x38bdf8, hatColor: 0x0ea5e9, weapon: 'spear',        weaponLvl: 3, style: 'melee' },
  { name: 'Zara',     tag: 'EMR', tunic: 0x0f766e, cape: 0x34d399, skin: 0x8d5524, hair: 0xcbd5e1, hatColor: 0x14b8a6, weapon: 'storm_bow',    weaponLvl: 4, style: 'ranged' },
  { name: 'Vex',      tag: 'VOD', tunic: 0x7e22ce, cape: 0xfb7185, skin: 0xffe4cc, hair: 0xc9382b, hatColor: 0xe11d48, weapon: 'venom_dagger', weaponLvl: 5, style: 'melee' },
  { name: 'Aurelius', tag: 'MYT', tunic: 0xb91c1c, cape: 0xfacc15, skin: 0xe0ac69, hair: 0xfacc15, hatColor: 0xfacc15, weapon: 'sunblade',     weaponLvl: 6, style: 'melee' },
];

// Sky Arena PvP AI Match Tiers (Solo or Guild Skirmish!)
export const ARENA_TIERS = [
  { tier: 1, name: 'Bronze Duel (1v1)',     reward: 35,  baseHp: 110, bots: [0],          desc: '1v1 vs tactical AI Knight Kaelen' },
  { tier: 2, name: 'Silver Clash (1v2)',    reward: 65,  baseHp: 145, bots: [1, 2],       desc: 'Fight AI Ranger Lyra & Axe Berserker Ryker' },
  { tier: 3, name: 'Gold Skirmish (2v3)',   reward: 110, baseHp: 185, bots: [3, 4, 5],    desc: '3 Elite AI Bots (+1 AI Guild Ally if in a Guild!)' },
  { tier: 4, name: 'Mythic Trial (Boss AI)',reward: 180, baseHp: 240, bots: [7, 6, 5],    desc: 'Grand AI Champion Aurelius + 2 Elite AI Guards' },
];

// Per-World Progressive Difficulty Tiers (Finish World on Easy -> Unlock Medium -> Finish Medium -> Unlock Hard!)
export const DIFFICULTY_TIERS = [
  {
    id: 'easy', tier: 0, name: 'EASY', short: 'EASY', color: '#34d399',
    hpMult: 1.0, bossHpMult: 1.0, speedMult: 1.0, trapSpeedMult: 1.0, fireRateMult: 1.0,
    coinMult: 1.0, dmgBonus: 0, smartAi: false,
    desc: 'Standard adventure difficulty · Clear Lv 100 to unlock MEDIUM',
  },
  {
    id: 'medium', tier: 1, name: 'MEDIUM', short: 'MED', color: '#facc15',
    hpMult: 1.65, bossHpMult: 1.85, speedMult: 1.18, trapSpeedMult: 1.20, fireRateMult: 0.80,
    coinMult: 1.5, dmgBonus: 0, smartAi: true,
    desc: 'Mid-Range: Smart AI, faster blades & traps, +50% Credits · Clear Lv 100 to unlock HARD',
  },
  {
    id: 'hard', tier: 2, name: 'HARD', short: 'HARD', color: '#f43f5e',
    hpMult: 2.55, bossHpMult: 2.90, speedMult: 1.34, trapSpeedMult: 1.36, fireRateMult: 0.65,
    coinMult: 2.25, dmgBonus: 1, smartAi: true,
    desc: 'Hardcore: Deadly armored Bosses, rapid traps, +125% Credits!',
  },
];

export function getWorldDifficulty(state, worldId) {
  if (!state || !WORLD_ORDER.includes(worldId)) return DIFFICULTY_TIERS[0];
  const unlockedMax = Math.max(0, Math.min(2, state.worldDifficultyUnlocked?.[worldId] ?? (state.completedWorlds?.[worldId] ? 1 : 0)));
  const rawSel = Math.max(0, Math.min(2, state.worldDifficultySelected?.[worldId] ?? 0));
  const tier = state.previewAll ? rawSel : Math.min(rawSel, unlockedMax);
  return DIFFICULTY_TIERS[tier] || DIFFICULTY_TIERS[0];
}

export function getWorldDiffMaxLevel(state, worldId, tier = null) {
  if (!state || !WORLD_ORDER.includes(worldId)) return 1;
  const t = tier === null ? getWorldDifficulty(state, worldId).tier : Math.max(0, Math.min(2, tier));
  const arr = state.worldDifficultyMaxLevel?.[worldId];
  if (Array.isArray(arr) && typeof arr[t] === 'number') return Math.max(1, Math.min(100, arr[t]));
  return t === 0 ? Math.max(1, state.maxLevel?.[worldId] || 1) : 1;
}

// Guild Hard Mode: Being in a Guild makes Enemy NPCs & Arena AI significantly harder!
export function getGuildDifficulty(state) {
  if (!state || !state.guild) {
    return { active: false, hpMult: 1, speedMult: 1, fireRateMult: 1, smartAi: false, label: '' };
  }
  const gLvl = Math.max(1, state.guild.level || 1);
  return {
    active: true,
    hpMult: 1.55 + Math.min(0.65, (gLvl - 1) * 0.12),
    speedMult: 1.24 + Math.min(0.26, (gLvl - 1) * 0.04),
    fireRateMult: Math.max(0.58, 0.76 - (gLvl - 1) * 0.03),
    smartAi: true,
    label: `GUILD HARD (${Math.round((1.55 + Math.min(0.65, (gLvl - 1) * 0.12)) * 100)}% HP)`,
  };
}

export const GLOW_TIERS = [
  { level: 1, name: 'Base',    hex: '#cbd5e1', color: 0xcbd5e1, emissive: 0x000000, intensity: 0.0 },
  { level: 2, name: 'Cyan',    hex: '#38bdf8', color: 0x38bdf8, emissive: 0x0ea5e9, intensity: 0.55 },
  { level: 3, name: 'Emerald', hex: '#34d399', color: 0x34d399, emissive: 0x10b981, intensity: 0.72 },
  { level: 4, name: 'Gold',    hex: '#facc15', color: 0xfacc15, emissive: 0xf59e0b, intensity: 0.88 },
  { level: 5, name: 'Violet',  hex: '#c084fc', color: 0xc084fc, emissive: 0xa855f7, intensity: 1.0 },
  { level: 6, name: 'Mythic',  hex: '#fb7185', color: 0xfb7185, emissive: 0xf43f5e, intensity: 1.2, pulse: true },
];

export function getGlowTier(lvl) {
  const idx = Math.max(0, Math.min(GLOW_TIERS.length - 1, (lvl || 1) - 1));
  return GLOW_TIERS[idx];
}

// Specific Arrow Types for Bows (separate Store slot, level-gated!)
export const ARROW_TYPES = [
  { id: 'wood',      name: 'Wood Arrows',      bonusDmg: 0,  cost: 0,   reqLevel: 1,  color: 0xe2e8f0, hex: '#e2e8f0', desc: 'Standard arrows included with any Bow' },
  { id: 'iron',      name: 'Iron Arrows',      bonusDmg: 10, cost: 110, reqLevel: 10, color: 0x38bdf8, hex: '#38bdf8', desc: '+10 Bow Damage · Cyan piercing tip' },
  { id: 'fire',      name: 'Flame Arrows',     bonusDmg: 22, cost: 240, reqLevel: 25, color: 0xf97316, hex: '#f97316', desc: '+22 Bow Damage · Blazing ember trail' },
  { id: 'lightning', name: 'Lightning Arrows', bonusDmg: 38, cost: 420, reqLevel: 50, color: 0xfacc15, hex: '#facc15', desc: '+38 Bow Damage · Hyper-fast storm bolt' },
];

// Slotted Fantasy Weapon Catalog (NO Gun!) with balanced level gates, buy & modest sell prices
export const WEAPON_CATALOG = {
  stone:        { id: 'stone',        slot: 'Starter',    model: 'stone',  name: 'Stone Throw',   baseDamage: 14, cooldown: 0.36, range: 16,  buyCost: 0,   reqLevel: 1,  sellValue: 0,  tint: 0x94a3b8, desc: 'Built-in arcing stone throw' },
  knife:        { id: 'knife',        slot: 'Knife',      model: 'knife',  name: 'Steel Knife',   baseDamage: 20, cooldown: 0.25, range: 19,  buyCost: 85,  reqLevel: 1,  sellValue: 12, tint: 0xe2e8f0, desc: 'Fast straight throwing knife' },
  kunai:        { id: 'kunai',        slot: 'Knife',      model: 'knife',  name: 'Shadow Kunai',  baseDamage: 32, cooldown: 0.21, range: 21,  buyCost: 230, reqLevel: 22, sellValue: 32, tint: 0xc084fc, desc: 'Rapid violet assassin throwing blade' },
  dagger:       { id: 'dagger',       slot: 'Dagger',     model: 'dagger', name: 'Twin Dagger',   baseDamage: 26, cooldown: 0.19, range: 3.5, buyCost: 115, reqLevel: 3,  sellValue: 16, tint: 0x67e8f9, desc: 'Ultra-rapid melee strike + lunge' },
  venom_dagger: { id: 'venom_dagger', slot: 'Dagger',     model: 'dagger', name: 'Venom Fang',    baseDamage: 42, cooldown: 0.17, range: 3.8, buyCost: 280, reqLevel: 28, sellValue: 38, tint: 0x34d399, desc: 'Emerald flurry dagger with high speed' },
  bow:          { id: 'bow',          slot: 'Bow',        model: 'bow',    name: 'Hunter Bow',    baseDamage: 28, cooldown: 0.28, range: 26,  buyCost: 150, reqLevel: 5,  sellValue: 22, tint: 0x92400e, desc: 'Long-range bow (uses equipped Arrows)' },
  storm_bow:    { id: 'storm_bow',    slot: 'Bow',        model: 'bow',    name: 'Storm Longbow', baseDamage: 46, cooldown: 0.23, range: 30,  buyCost: 350, reqLevel: 35, sellValue: 48, tint: 0x38bdf8, desc: 'Elite sky longbow with rapid shots' },
  spear:        { id: 'spear',        slot: 'Spear',      model: 'spear',  name: 'Iron Spear',    baseDamage: 34, cooldown: 0.30, range: 5.4, buyCost: 180, reqLevel: 8,  sellValue: 26, tint: 0xcbd5e1, desc: 'Long-reach piercing thrust' },
  dragon_lance: { id: 'dragon_lance', slot: 'Spear',      model: 'spear',  name: 'Dragon Lance',  baseDamage: 54, cooldown: 0.27, range: 6.2, buyCost: 390, reqLevel: 45, sellValue: 54, tint: 0xfb7185, desc: 'Royal extended lance with huge reach' },
  sword:        { id: 'sword',        slot: 'Sword',      model: 'sword',  name: 'Knight Sword',  baseDamage: 40, cooldown: 0.33, range: 4.5, buyCost: 210, reqLevel: 12, sellValue: 30, tint: 0xe2e8f0, desc: 'Wide sweeping cleave + knockback' },
  sunblade:     { id: 'sunblade',     slot: 'Sword',      model: 'sword',  name: 'Sunblade',      baseDamage: 64, cooldown: 0.29, range: 5.0, buyCost: 460, reqLevel: 60, sellValue: 64, tint: 0xfacc15, desc: 'Radiant golden greatsword cleave' },
  axe:          { id: 'axe',          slot: 'Battle Axe', model: 'axe',    name: 'Battle Axe',    baseDamage: 52, cooldown: 0.44, range: 4.9, buyCost: 250, reqLevel: 16, sellValue: 36, tint: 0x94a3b8, desc: 'Heavy shockwave smash + knockback' },
  titan_axe:    { id: 'titan_axe',    slot: 'Battle Axe', model: 'axe',    name: 'Titan Waraxe',  baseDamage: 82, cooldown: 0.40, range: 5.5, buyCost: 560, reqLevel: 80, sellValue: 76, tint: 0xf97316, desc: 'Colossal boss-crushing double axe' },
};

export const WEAPON_IDS = Object.keys(WEAPON_CATALOG);
export const LOOT_WEAPON_IDS = ['knife', 'dagger', 'bow', 'spear', 'sword', 'axe'];
export const RARE_BOSS_WEAPON_IDS = ['kunai', 'venom_dagger', 'storm_bow', 'dragon_lance', 'sunblade', 'titan_axe'];

// Story Lore & Chapter Quests (given by Talkable NPCs in Safe Haven!)
export const GAME_STORY = {
  title: 'Chronicle of the Shattered Sky',
  intro: 'Long ago, the Sky Crown kept the four realms—Sky Forest, Sky Beach, Sky Desert, and Sky Dungeon—floating in harmony around Safe Haven. When the Void Overlord shattered the Crown and scattered its Relics across 400 sky islands, raiders overran every realm. Speak with the elders of Safe Haven, forge glowing gear, form an Alliance, and reclaim the skies!',
};

export const QUEST_CATALOG = [
  {
    id: 'q_ch1_patrol',
    chapter: 'Ch. 1',
    npcId: 'elder',
    npc: 'Elder Rowan',
    title: 'Awakening in the Forest',
    story: 'Raiders have seized the Sky Forest portals! Prove your courage by defeating 10 enemies on the floating canopy islands.',
    desc: 'Defeat 10 Enemy NPCs',
    waypointHint: 'Enter Sky Forest Portal & defeat enemies',
    goalType: 'kills',
    target: 10,
    rewardCredits: 45,
    rewardWeapon: null,
    rewardPreview: ['+45 Credits', 'Unlocks Ch. 2 Storyline'],
  },
  {
    id: 'q_ch2_canopy',
    chapter: 'Ch. 2',
    npcId: 'elder',
    npc: 'Elder Rowan',
    title: 'Relics of the Emerald Canopy',
    story: 'Each Relic restores power to Safe Haven. Push deeper into Sky Forest and recover the Relics through Level 3.',
    desc: 'Unlock Sky Forest Level 4',
    waypointHint: 'Clear Sky Forest Levels 1–3 via Portal',
    goalType: 'forestLvl',
    target: 4,
    rewardCredits: 70,
    rewardWeapon: 'knife',
    rewardPreview: ['+70 Credits', 'Steel Knife + Sky Forest Boost'],
  },
  {
    id: 'q_merchant_gear',
    chapter: 'Ch. 3',
    npcId: 'merchant',
    npc: 'Merchant Mira',
    title: 'Arm the Explorer',
    story: 'Step up to my Weapon & Gear Store in Safe Haven! Expand your arsenal by owning at least 2 weapons in your Character Stash.',
    desc: 'Own 2+ Weapons in your Stash',
    waypointHint: 'Visit Merchant Mira at the Weapon & Gear Store',
    goalType: 'weaponsOwned',
    target: 2,
    rewardCredits: 65,
    rewardWeapon: null,
    rewardPreview: ['+65 Credits', 'Weapon Store Patron Bonus'],
  },
  {
    id: 'q_ch3_forge',
    chapter: 'Ch. 4',
    npcId: 'smith',
    npc: 'Blacksmith Torin',
    title: 'Awaken the Cyan Glow',
    story: 'Ordinary steel shatters against higher realms! Visit my Blacksmith Forge and upgrade any weapon or your armor to Level 2 to awaken its Cyan Glow.',
    desc: 'Upgrade any Weapon or Armor to Lv2+',
    waypointHint: 'Visit Blacksmith Torin at the Forge / STORE → UPGRADES',
    goalType: 'gearLvl',
    target: 2,
    rewardCredits: 80,
    rewardWeapon: null,
    rewardPreview: ['+80 Credits', 'Cyan Glow Forge Mastery'],
  },
  {
    id: 'q_arena_duel',
    chapter: 'Ch. 5',
    npcId: 'arenamaster',
    npc: 'Champion Rex',
    title: 'Prove Yourself in the Duel Arena',
    story: 'Step through the Duel Arena Portal and defeat our tactical AI challengers to earn your mark as a Skybound Duelist!',
    desc: 'Win 1 Duel Arena Match',
    waypointHint: 'Enter the Duel Arena Portal & win a match',
    goalType: 'arenaWins',
    target: 1,
    rewardCredits: 120,
    rewardWeapon: 'dagger',
    rewardPreview: ['+120 Credits', 'Twin Dagger + Duelist Crest'],
  },
  {
    id: 'q_ch4_alliance',
    chapter: 'Ch. 6',
    npcId: 'guildmaster',
    npc: 'Guild Master Kael',
    title: 'Banner of the Skies',
    story: 'No explorer conquers 400 islands alone. Join or found a Guild / Alliance to unlock permanent battle buffs!',
    desc: 'Join or Create a Guild / Alliance',
    waypointHint: 'Talk to Guild Master Kael or click GUILD',
    goalType: 'hasGuild',
    target: 1,
    rewardCredits: 60,
    rewardWeapon: null,
    rewardPreview: ['+60 Credits', 'Permanent Guild Buff + Arena Ally'],
  },
  {
    id: 'q_ch5_boss',
    chapter: 'Ch. 7',
    npcId: 'guildmaster',
    npc: 'Guild Master Kael',
    title: 'Fall of the First Warden',
    story: 'Every 10th sky island is guarded by a towering Warden Boss. Defeat one and claim the Relic behind them!',
    desc: 'Clear any Level 10+ Boss Stage',
    waypointHint: 'Reach & clear a Lv 10 Boss Stage',
    goalType: 'bossClear',
    target: 1,
    rewardCredits: 150,
    rewardWeapon: 'sword',
    rewardPreview: ['+150 Credits', 'Knight Sword + Warden Slayer'],
  },
  {
    id: 'q_sky_beach',
    chapter: 'Ch. 8',
    npcId: 'elder',
    npc: 'Elder Rowan',
    title: 'Tides of the Sky Beach',
    story: 'With the emerald winds calming, sail through the Sky Beach Portal and reclaim the sun-drenched coral islands through Level 4!',
    desc: 'Unlock Sky Beach Level 5',
    waypointHint: 'Enter Sky Beach Portal & clear Levels 1–4',
    goalType: 'beachLvl',
    target: 5,
    rewardCredits: 160,
    rewardWeapon: 'storm_bow',
    rewardPreview: ['+160 Credits', 'Storm Longbow + Tidal Relic'],
  },
  {
    id: 'q_ch6_chest',
    chapter: 'Ch. 9',
    npcId: 'elder',
    npc: 'Elder Rowan',
    title: 'Vaults of the Ancients',
    story: 'Ancient explorers hid Golden Chests on every 25th island. Seek one out and open its seal!',
    desc: 'Open a Hidden Chest (Lv 25, 50, 75, 100)',
    waypointHint: 'Open a Hidden Golden Chest on Lv 25+',
    goalType: 'chests',
    target: 1,
    rewardCredits: 180,
    rewardWeapon: null,
    rewardPreview: ['+180 Credits', 'Rare Vault Weapon + Bonus CR'],
  },
  {
    id: 'q_sky_desert',
    chapter: 'Ch. 10',
    npcId: 'smith',
    npc: 'Blacksmith Torin',
    title: 'Crown of the Sky Desert',
    story: 'The golden dunes of Sky Desert hide sun-forged alloy! Enter the Sky Desert Portal and conquer through Level 4.',
    desc: 'Unlock Sky Desert Level 5',
    waypointHint: 'Enter Sky Desert Portal & clear Levels 1–4',
    goalType: 'desertLvl',
    target: 5,
    rewardCredits: 240,
    rewardWeapon: 'sunblade',
    rewardPreview: ['+240 Credits', 'Sunblade Greatsword'],
  },
  {
    id: 'q_sky_dungeon',
    chapter: 'Ch. 11',
    npcId: 'elder',
    npc: 'Elder Rowan',
    title: 'Cleanse the Sky Dungeon Crypt',
    story: 'Step into the soul-lit Sky Dungeon Portal and push back the Void Overlord’s legions through Level 4!',
    desc: 'Unlock Sky Dungeon Level 5',
    waypointHint: 'Enter Sky Dungeon Portal & clear Levels 1–4',
    goalType: 'dungeonLvl',
    target: 5,
    rewardCredits: 320,
    rewardWeapon: 'dragon_lance',
    rewardPreview: ['+320 Credits', 'Dragon Lance + Crypt Relics'],
  },
  {
    id: 'q_ch7_champion',
    chapter: 'Ch. 12',
    npcId: 'elder',
    npc: 'Elder Rowan',
    title: 'Savior of the Four Realms',
    story: 'The Void Overlord watches from Sky Dungeon. Defeat 80 raiders across the realms to weaken his grip!',
    desc: 'Defeat 80 Enemy NPCs total',
    waypointHint: 'Defeat raiders across any Realm or Duel Arena',
    goalType: 'kills',
    target: 80,
    rewardCredits: 360,
    rewardWeapon: 'titan_axe',
    rewardPreview: ['+360 Credits', 'Titan Waraxe + Champion Title'],
  },
];

export function getActiveTrackedQuest(state) {
  if (!state || !state.quests) return null;
  const acc = state.quests.accepted || [];
  const clm = state.quests.claimed || [];
  if (state.trackedQuestId && acc.includes(state.trackedQuestId) && !clm.includes(state.trackedQuestId)) {
    return QUEST_CATALOG.find((q) => q.id === state.trackedQuestId) || null;
  }
  const firstActive = QUEST_CATALOG.find((q) => acc.includes(q.id) && !clm.includes(q.id));
  return firstActive || null;
}

export const GUILD_MAX_MEMBERS = 100;

// Buff choices a Guild Leader can pick when founding their own Guild
export const GUILD_BUFF_OPTIONS = [
  { bonusType: 'dmg',   bonusVal: 0.10, perk: '+10% Attack Damage', color: '#38bdf8' },
  { bonusType: 'coins', bonusVal: 0.12, perk: '+12% Credit Coins',  color: '#34d399' },
  { bonusType: 'spd',   bonusVal: 0.10, perk: '+10% Move Speed',    color: '#f59e0b' },
  { bonusType: 'luck',  bonusVal: 0.10, perk: '+10% Rare Drop Luck',color: '#c084fc' },
];

export function makeDefaultPlayerName() {
  return 'Explorer' + Math.floor(1000 + Math.random() * 9000);
}

export const STARTER_GUILDS = [
  { id: 'vanguard', name: 'Skyward Vanguard', tag: 'SKY', color: '#38bdf8', perk: '+10% Attack Damage', bonusType: 'dmg',   bonusVal: 0.10, members: 18 },
  { id: 'emerald',  name: 'Emerald Blades',   tag: 'EMR', color: '#34d399', perk: '+12% Credit Coins',  bonusType: 'coins', bonusVal: 0.12, members: 24 },
  { id: 'dunes',    name: 'Dune Raiders',     tag: 'SUN', color: '#f59e0b', perk: '+10% Move Speed',    bonusType: 'spd',   bonusVal: 0.10, members: 14 },
  { id: 'void',     name: 'Void Hunters',     tag: 'VOD', color: '#c084fc', perk: '+10% Rare Drop Luck',bonusType: 'luck',  bonusVal: 0.10, members: 11 },
];

export function getQuestProgress(state, q) {
  if (q.goalType === 'kills') return Math.min(q.target, state.totalKills || 0);
  if (q.goalType === 'forestLvl') return Math.min(q.target, state.maxLevel?.forest || 1);
  if (q.goalType === 'beachLvl') return Math.min(q.target, state.maxLevel?.beach || 1);
  if (q.goalType === 'desertLvl') return Math.min(q.target, state.maxLevel?.desert || 1);
  if (q.goalType === 'dungeonLvl') return Math.min(q.target, state.maxLevel?.dungeon || 1);
  if (q.goalType === 'weaponsOwned') return Math.min(q.target, (state.bagSlots || []).length);
  if (q.goalType === 'arenaWins') return Math.min(q.target, state.arenaWins || 0);
  if (q.goalType === 'gearLvl') {
    const maxW = Math.max(1, ...(state.bagSlots || []).map((i) => i.level || 1));
    return Math.min(q.target, Math.max(maxW, state.armorLevel || 1));
  }
  if (q.goalType === 'hasGuild') return state.guild ? 1 : 0;
  if (q.goalType === 'bossClear') return Math.min(q.target, state.bossesCleared || 0);
  if (q.goalType === 'chests') return Math.min(q.target, Object.keys(state.openedChests || {}).length);
  return 0;
}

export const AVATAR_OPTIONS = {
  gender: [
    { id: 'male',   name: 'Male' },
    { id: 'female', name: 'Female' },
  ],
  skin: [
    { id: 'peach', name: 'Peach', hex: '#ffd1a9' },
    { id: 'fair',  name: 'Fair',  hex: '#ffe4cc' },
    { id: 'tan',   name: 'Tan',   hex: '#e0ac69' },
    { id: 'olive', name: 'Olive', hex: '#c68642' },
    { id: 'brown', name: 'Brown', hex: '#8d5524' },
    { id: 'deep',  name: 'Deep',  hex: '#5c3818' },
  ],
  hairStyle: [
    { id: 'hat',    name: 'Explorer Hat' },
    { id: 'short',  name: 'Short Crop' },
    { id: 'spiky',  name: 'Spiky' },
    { id: 'long',   name: 'Long' },
    { id: 'mohawk', name: 'Mohawk' },
    { id: 'bald',   name: 'None' },
  ],
  femaleHairStyle: [
    { id: 'ponytail',  name: 'High Ponytail' },
    { id: 'twintails', name: 'Twin Tails' },
    { id: 'hat',       name: 'Hat + Locks' },
    { id: 'long',      name: 'Long Flowing' },
    { id: 'bob',       name: 'Sleek Bob' },
    { id: 'tiara',     name: 'Tiara + Bun' },
  ],
  hairColor: [
    { id: 'brown',  name: 'Brown',  hex: '#5c3a21' },
    { id: 'black',  name: 'Black',  hex: '#1e1b24' },
    { id: 'blonde', name: 'Blonde', hex: '#f5c542' },
    { id: 'red',    name: 'Crimson',hex: '#c9382b' },
    { id: 'silver', name: 'Silver', hex: '#cbd5e1' },
    { id: 'cyan',   name: 'Cyan',   hex: '#38bdf8' },
    { id: 'violet', name: 'Violet', hex: '#a855f7' },
    { id: 'rose',   name: 'Rose',   hex: '#f472b6' },
  ],
  beard: [
    { id: 'none',     name: 'None' },
    { id: 'stubble',  name: 'Stubble' },
    { id: 'mustache', name: 'Mustache' },
    { id: 'goatee',   name: 'Goatee' },
    { id: 'full',     name: 'Full Beard' },
  ],
  emotion: [
    { id: 'happy',      name: 'Happy' },
    { id: 'determined', name: 'Determined' },
    { id: 'cool',       name: 'Cool Shades' },
    { id: 'fierce',     name: 'Fierce' },
    { id: 'surprised',  name: 'Surprised' },
    { id: 'wink',       name: 'Wink' },
  ],
  outfit: [
    { id: 'explorer', name: 'Sky Explorer', tunic: '#2563eb', cape: '#f43f5e', boots: '#3f2e21' },
    { id: 'ranger',   name: 'Forest Ranger',tunic: '#15803d', cape: '#854d0e', boots: '#292524' },
    { id: 'sailor',   name: 'Ocean Sailor', tunic: '#0284c7', cape: '#f8fafc', boots: '#1e3a8a' },
    { id: 'nomad',    name: 'Desert Nomad', tunic: '#d97706', cape: '#fef08a', boots: '#78350f' },
    { id: 'rogue',    name: 'Shadow Rogue', tunic: '#334155', cape: '#7e22ce', boots: '#0f172a' },
    { id: 'royal',    name: 'Royal Guard',  tunic: '#b91c1c', cape: '#facc15', boots: '#451a03' },
  ],
};

let uidCounter = Date.now();
export function nextItemUid() {
  uidCounter += 1;
  return 'itm_' + uidCounter.toString(36);
}

export function makePlayerId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = 'SKY-';
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function createDefaultSave() {
  return {
    version: 4,
    savedAt: Date.now(),
    playerId: makePlayerId(),
    isOwnerBadge: false,
    credits: 50,
    currentWorld: 'haven',
    lastWorld: 'forest',
    lastLevel: 1,
    unlockedWorlds: { forest: true, beach: false, desert: false, dungeon: false },
    maxLevel: { forest: 1, beach: 1, desert: 1, dungeon: 1 },
    completedWorlds: { forest: false, beach: false, desert: false, dungeon: false },
    worldDifficultyUnlocked: { forest: 0, beach: 0, desert: 0, dungeon: 0 },
    worldDifficultySelected: { forest: 0, beach: 0, desert: 0, dungeon: 0 },
    worldDifficultyMaxLevel: {
      forest: [1, 1, 1],
      beach: [1, 1, 1],
      desert: [1, 1, 1],
      dungeon: [1, 1, 1],
    },
    // 15-Slot Bag storing collected weapon items ({ uid, weaponId, level })
    bagSlots: [
      { uid: 'starter_stone', weaponId: 'stone', level: 1, locked: true },
    ],
    equippedUid: 'starter_stone',
    arrowsOwned: { wood: true, iron: false, fire: false, lightning: false },
    equippedArrow: 'wood',
    armorLevel: 1,
    maxHearts: 3, // Upgradable 3 -> 6 Hearts (with live HP% display!)
    stats: { str: 1, sta: 1, spd: 1 },
    abilities: { doubleJump: true, dash: true },
    abilityLevels: { skyGlide: 1, tripleJump: 1, shockwaveSlam: 1, aegisShield: 1, skyNova: 1 },
    partyIds: [], // Up to 2 invited Safe Haven AI Explorer Companions who fight with you across ALL worlds & Arena!
    avatar: {
      gender: 'male',
      skin: 'peach',
      hairStyle: 'hat',
      hairColor: 'brown',
      beard: 'none',
      emotion: 'happy',
      outfit: 'explorer',
    },
    totalKills: 0,
    bossesCleared: 0,
    arenaWins: 0,
    arenaBestTier: 0,
    openedChests: {},
    quests: { accepted: ['q_ch1_patrol'], claimed: [] },
    trackedQuestId: 'q_ch1_patrol',
    playerName: makeDefaultPlayerName(),
    characterCreated: false,
    tutorialSeen: false,
    autoAim: true,
    autoHeartRegen: true,
    guild: null,
    previewAll: false,
    godMode: false,
  };
}

export function getEquippedItem(state) {
  const found = (state.bagSlots || []).find((it) => it.uid === state.equippedUid);
  if (found && WEAPON_CATALOG[found.weaponId]) return found;
  return state.bagSlots[0] || { uid: 'starter_stone', weaponId: 'stone', level: 1, locked: true };
}

export function addItemToBag(state, weaponId, level = 1) {
  if (!WEAPON_CATALOG[weaponId]) return { ok: false, reason: 'invalid' };
  if (state.bagSlots.length >= BAG_MAX_SLOTS) {
    return { ok: false, reason: 'full' };
  }
  const item = { uid: nextItemUid(), weaponId, level };
  state.bagSlots.push(item);
  return { ok: true, item };
}

export function getItemSellPrice(item) {
  const def = WEAPON_CATALOG[item.weaponId];
  if (!def || item.locked || def.sellValue <= 0) return 0;
  // Modest sell value (~15% of shop price + small bonus per upgrade level) so Credit Packs stay valuable
  return Math.round(def.sellValue + (item.level - 1) * 14);
}

export function sellBagItem(state, uid) {
  const idx = state.bagSlots.findIndex((it) => it.uid === uid);
  if (idx < 0) return 0;
  const item = state.bagSlots[idx];
  if (item.locked) return 0;
  const payout = getItemSellPrice(item);
  state.bagSlots.splice(idx, 1);
  if (state.equippedUid === uid) {
    state.equippedUid = state.bagSlots[0]?.uid || 'starter_stone';
  }
  addCredits(state, payout);
  return payout;
}

export function loadGameSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const base = createDefaultSave();
    const slots = Array.isArray(parsed.bagSlots) && parsed.bagSlots.length > 0
      ? parsed.bagSlots.filter((it) => it && WEAPON_CATALOG[it.weaponId]).slice(0, BAG_MAX_SLOTS)
      : base.bagSlots;
    if (!slots.some((it) => it.weaponId === 'stone')) {
      slots.unshift({ uid: 'starter_stone', weaponId: 'stone', level: 1, locked: true });
    }
    const merged = {
      ...base,
      ...parsed,
      unlockedWorlds: { ...base.unlockedWorlds, ...(parsed.unlockedWorlds || {}) },
      maxLevel: { ...base.maxLevel, ...(parsed.maxLevel || {}) },
      completedWorlds: { ...base.completedWorlds, ...(parsed.completedWorlds || {}) },
      worldDifficultyUnlocked: { ...base.worldDifficultyUnlocked, ...(parsed.worldDifficultyUnlocked || {}) },
      worldDifficultySelected: { ...base.worldDifficultySelected, ...(parsed.worldDifficultySelected || {}) },
      worldDifficultyMaxLevel: { ...base.worldDifficultyMaxLevel },
      bagSlots: slots,
      arrowsOwned: { ...base.arrowsOwned, ...(parsed.arrowsOwned || {}) },
      maxHearts: Math.max(3, Math.min(6, Number(parsed.maxHearts) || 3)),
      stats: { ...base.stats, ...(parsed.stats || {}) },
      abilities: { ...base.abilities, ...(parsed.abilities || {}) },
      abilityLevels: { ...base.abilityLevels, ...(parsed.abilityLevels || {}) },
      partyIds: Array.isArray(parsed.partyIds) ? parsed.partyIds.slice(0, 2) : [],
      avatar: { ...base.avatar, ...(parsed.avatar || {}) },
      openedChests: { ...(parsed.openedChests || {}) },
      quests: {
        accepted: Array.isArray(parsed.quests?.accepted) ? [...parsed.quests.accepted] : ['q_ch1_patrol'],
        claimed: Array.isArray(parsed.quests?.claimed) ? [...parsed.quests.claimed] : [],
      },
      trackedQuestId: typeof parsed.trackedQuestId === 'string' ? parsed.trackedQuestId : 'q_ch1_patrol',
      playerId: (typeof parsed.playerId === 'string' && /^SKY-[A-Z0-9]{4,8}$/.test(parsed.playerId.trim().toUpperCase()))
        ? parsed.playerId.trim().toUpperCase()
        : base.playerId,
      isOwnerBadge: Boolean(parsed.isOwnerBadge),
      playerName: (typeof parsed.playerName === 'string' && parsed.playerName.trim()) ? parsed.playerName.trim().slice(0, 16) : base.playerName,
      characterCreated: typeof parsed.characterCreated === 'boolean'
        ? parsed.characterCreated
        : Boolean((parsed.totalKills || 0) > 0 || (parsed.credits !== undefined && parsed.credits !== 50) || slots.length > 1 || parsed.guild || (parsed.arenaWins || 0) > 0),
      tutorialSeen: typeof parsed.tutorialSeen === 'boolean' ? parsed.tutorialSeen : false,
      autoAim: typeof parsed.autoAim === 'boolean' ? parsed.autoAim : true,
      autoHeartRegen: typeof parsed.autoHeartRegen === 'boolean' ? parsed.autoHeartRegen : true,
      guild: parsed.guild || null,
    };
    if (!merged.bagSlots.some((it) => it.uid === merged.equippedUid)) {
      merged.equippedUid = merged.bagSlots[0].uid;
    }
    for (const wId of WORLD_ORDER) {
      if (merged.completedWorlds[wId] && (merged.worldDifficultyUnlocked[wId] || 0) < 1) {
        merged.worldDifficultyUnlocked[wId] = 1;
      }
      const pArr = parsed.worldDifficultyMaxLevel?.[wId];
      merged.worldDifficultyMaxLevel[wId] = [
        Math.max(merged.maxLevel[wId] || 1, Array.isArray(pArr) ? (pArr[0] || 1) : 1),
        Array.isArray(pArr) ? Math.max(1, pArr[1] || 1) : 1,
        Array.isArray(pArr) ? Math.max(1, pArr[2] || 1) : 1,
      ];
    }
    return merged;
  } catch {
    return null;
  }
}

export function writeGameSave(state) {
  state.savedAt = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); return true; } catch { return false; }
}

export function exportSaveCode(state) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(state)))); } catch { return ''; }
}

export function importSaveCode(code) {
  try {
    const json = decodeURIComponent(escape(atob(code.trim())));
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.bagSlots)) return null;
    localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
    return loadGameSave();
  } catch {
    return null;
  }
}

export function getEquippedArrow(state) {
  return ARROW_TYPES.find((a) => a.id === state.equippedArrow) || ARROW_TYPES[0];
}

export function getItemDamage(state, item = getEquippedItem(state)) {
  const def = WEAPON_CATALOG[item.weaponId] || WEAPON_CATALOG.stone;
  const lvl = item.level || 1;
  const arrowBonus = def.model === 'bow' ? getEquippedArrow(state).bonusDmg : 0;
  const strMult = 1 + (state.stats.str - 1) * 0.22;
  const lvlMult = 1 + (lvl - 1) * 0.48;
  const guildBonus = state.guild?.bonusType === 'dmg' ? (1 + (state.guild.bonusVal || 0.1) + ((state.guild.level || 1) - 1) * 0.03) : 1;
  return Math.round((def.baseDamage + arrowBonus) * lvlMult * strMult * guildBonus);
}

export function getWeaponUpgradeCost(lvl) {
  return Math.round(75 * Math.pow(1.65, lvl - 1));
}

export function getArmorUpgradeCost(lvl) {
  return Math.round(90 * Math.pow(1.7, lvl - 1));
}

export function getStatUpgradeCost(lvl) {
  return Math.round(65 * Math.pow(1.52, lvl - 1));
}

// Player Progression Level across all 4 Worlds (1..400) for Level-Gated Store Buying & Gear Upgrades!
export function getPlayerProgressLevel(state) {
  if (!state) return 1;
  if (state.previewAll) return 400;
  let total = Math.max(1, state.maxLevel?.forest || 1);
  if (state.unlockedWorlds?.beach)   total += Math.max(0, (state.maxLevel?.beach || 1) - 1) + (state.completedWorlds?.forest ? 1 : 0);
  if (state.unlockedWorlds?.desert)  total += Math.max(0, (state.maxLevel?.desert || 1) - 1) + (state.completedWorlds?.beach ? 1 : 0);
  if (state.unlockedWorlds?.dungeon) total += Math.max(0, (state.maxLevel?.dungeon || 1) - 1) + (state.completedWorlds?.desert ? 1 : 0);
  return Math.max(1, Math.min(400, total));
}

// Required Player Stage Level to upgrade any Weapon or Armor to nextLvl (Lv2 -> Lv6)
export const GEAR_UPGRADE_REQ_LEVELS = { 2: 5, 3: 15, 4: 30, 5: 55, 6: 90 };
export function getGearUpgradeReqLevel(nextLvl) {
  return GEAR_UPGRADE_REQ_LEVELS[nextLvl] || 1;
}

// Required Player Stage Level to upgrade STR / STA / SPD to nextLvl (Lv2 -> Lv10)
export const STAT_UPGRADE_REQ_LEVELS = { 2: 3, 3: 8, 4: 15, 5: 24, 6: 35, 7: 48, 8: 62, 9: 80, 10: 100 };
export function getStatUpgradeReqLevel(nextLvl) {
  return STAT_UPGRADE_REQ_LEVELS[nextLvl] || 1;
}

// Required Player Stage Level to upgrade Max Hearts (3 -> 4 -> 5 -> 6 MAX!)
export const HEART_UPGRADE_REQ_LEVELS = { 4: 10, 5: 25, 6: 50 };
export const HEART_UPGRADE_COSTS = { 4: 180, 5: 380, 6: 750 };
export function getHeartUpgradeReqLevel(nextHearts) {
  return HEART_UPGRADE_REQ_LEVELS[nextHearts] || 1;
}
export function getHeartUpgradeCost(nextHearts) {
  return HEART_UPGRADE_COSTS[nextHearts] || 180;
}
export function getPlayerMaxHearts(state) {
  return Math.max(3, Math.min(6, Number(state?.maxHearts) || 3));
}

export function addCredits(state, amount) {
  state.credits = Math.max(0, Math.floor((state.credits || 0) + amount));
  return state.credits;
}

// =========================================================================
// UNLOCKABLE HERO ABILITIES (Option A: Free auto-unlock at Rank Milestones!)
// Enhanceable up to Difficulty Tier Cap across ALL worlds:
// EASY -> Lv 1..3 | MEDIUM -> Lv 4..6 | HARD -> Lv 7..9 (MAX)
// =========================================================================
export const ABILITY_CATALOG = [
  {
    id: 'skyGlide', name: 'Sky Glide', short: 'GLIDE', type: 'passive', reqLevel: 5,
    keyLabel: 'HOLD JUMP', padLabel: 'HOLD A/✕', color: '#38bdf8', icon: '🪽',
    iconImg: './assets/abilities/sky-glide.png',
    desc: 'Hold Jump in midair to deploy glowing Sky Wings & glide smoothly across gaps.',
  },
  {
    id: 'tripleJump', name: 'Triple Jump', short: '3X JUMP', type: 'passive', reqLevel: 10,
    keyLabel: '3x JUMP', padLabel: '3x A/✕', color: '#34d399', icon: '⬆',
    iconImg: './assets/abilities/triple-jump.png',
    desc: 'Grants a 3rd midair Sky Leap with a golden wind ring burst (+shock push at Lv5+).',
  },
  {
    id: 'shockwaveSlam', name: 'Shockwave Slam', short: 'SLAM', type: 'active', reqLevel: 15,
    keyLabel: '1', padLabel: 'LT/L2', color: '#f97316', icon: '💥',
    iconImg: './assets/abilities/shockwave-slam.png',
    desc: 'Unleashes an expanding 3D shockwave ring dealing heavy AOE damage & knockback.',
  },
  {
    id: 'aegisShield', name: 'Aegis Shield', short: 'SHIELD', type: 'active', reqLevel: 25,
    keyLabel: '2', padLabel: 'L1+R1', color: '#facc15', icon: '🛡',
    iconImg: './assets/abilities/aegis-shield.png',
    desc: 'Summons a glowing golden barrier blocking hits, arrows, spikes & magma (+Thorns Lv6+).',
  },
  {
    id: 'skyNova', name: 'Sky Lightning Nova', short: 'NOVA', type: 'active', reqLevel: 40,
    keyLabel: '3', padLabel: 'L3+R3', color: '#c084fc', icon: '⚡',
    iconImg: './assets/abilities/sky-nova.png',
    desc: 'Calls down 3D sky lightning pillars on nearby enemies & bosses for massive burst + stun.',
  },
];

export const ABILITY_BY_ID = Object.fromEntries(ABILITY_CATALOG.map((a) => [a.id, a]));

export function getHighestUnlockedDifficultyTier(state) {
  if (!state) return 0;
  if (state.previewAll) return 2;
  let best = 0;
  for (const wId of WORLD_ORDER) {
    const t = Math.max(
      state.worldDifficultyUnlocked?.[wId] || 0,
      state.completedWorlds?.[wId] ? 1 : 0
    );
    if (t > best) best = t;
  }
  return Math.max(0, Math.min(2, best));
}

export function getAbilityMaxLevelForState(state) {
  return (getHighestUnlockedDifficultyTier(state) + 1) * 3; // EASY=3, MEDIUM=6, HARD=9
}

export function isAbilityUnlocked(state, abilityId) {
  const def = ABILITY_BY_ID[abilityId];
  if (!def) return false;
  if (state?.previewAll) return true;
  return getPlayerProgressLevel(state) >= def.reqLevel;
}

export function getAbilityLevel(state, abilityId) {
  if (!isAbilityUnlocked(state, abilityId)) return 0;
  return Math.max(1, Math.min(9, state?.abilityLevels?.[abilityId] || 1));
}

export function getAbilityUpgradeCost(currentLvl) {
  return Math.round(80 * Math.pow(1.42, Math.max(0, (currentLvl || 1) - 1)));
}

export function getAbilityStats(state, abilityId, overrideLvl = null) {
  const lvl = overrideLvl !== null ? Math.max(1, Math.min(9, overrideLvl)) : Math.max(1, getAbilityLevel(state, abilityId) || 1);
  if (abilityId === 'skyGlide') {
    return {
      lvl,
      fallSpeed: +(3.6 - (lvl - 1) * 0.25).toFixed(2),
      speedBoost: +(1.10 + (lvl - 1) * 0.045).toFixed(2),
      wingScale: +(0.90 + (lvl - 1) * 0.07).toFixed(2),
      summary: `Fall -${(3.6 - (lvl - 1) * 0.25).toFixed(1)}m/s · +${Math.round((0.10 + (lvl - 1) * 0.045) * 100)}% Glide Speed`,
    };
  }
  if (abilityId === 'tripleJump') {
    const knockR = lvl >= 5 ? +(3.8 + (lvl - 5) * 0.65).toFixed(1) : 0;
    return {
      lvl,
      jumpVel: +(11.4 + (lvl - 1) * 0.42).toFixed(2),
      knockRadius: knockR,
      summary: `3rd Leap ${(11.4 + (lvl - 1) * 0.42).toFixed(1)}m/s${knockR > 0 ? ` · ${knockR}m Wind Push` : ''}`,
    };
  }
  if (abilityId === 'shockwaveSlam') {
    const dmgMult = +(1.8 + (lvl - 1) * 0.30).toFixed(2);
    const radius = +(5.5 + (lvl - 1) * 0.50).toFixed(1);
    const cooldown = +(8.0 - (lvl - 1) * 0.40).toFixed(1);
    return {
      lvl, dmgMult, radius, cooldown,
      knock: +(2.6 + (lvl - 1) * 0.25).toFixed(2),
      summary: `${dmgMult}x DMG · ${radius}m Radius · ${cooldown}s CD`,
    };
  }
  if (abilityId === 'aegisShield') {
    const duration = +(4.0 + (lvl - 1) * 0.40).toFixed(1);
    const cooldown = +(15.0 - (lvl - 1) * 0.68).toFixed(1);
    const thornsMult = lvl >= 6 ? +(0.85 + (lvl - 6) * 0.35).toFixed(2) : 0;
    return {
      lvl, duration, cooldown, thornsMult,
      summary: `${duration}s Shield · ${cooldown}s CD${thornsMult > 0 ? ` · ${thornsMult}x Thorns` : ''}`,
    };
  }
  const dmgMult = +(2.8 + (lvl - 1) * 0.45).toFixed(2);
  const targets = Math.min(8, 4 + Math.floor(lvl / 2));
  const stunSec = +(1.2 + (lvl - 1) * 0.15).toFixed(2);
  const radius = +(11.0 + (lvl - 1) * 0.85).toFixed(1);
  const cooldown = +(22.0 - (lvl - 1) * 1.05).toFixed(1);
  return {
    lvl, dmgMult, targets, stunSec, radius, cooldown,
    summary: `${dmgMult}x DMG · ${targets} Bolts · ${stunSec.toFixed(1)}s Stun · ${cooldown}s CD`,
  };
}
