// Grand Cloud Safe Haven Citadel + Sky Arena Colosseum + Extra-Wide 400-Level Seeded Biome Generator
import { WORLD_META, LOOT_WEAPON_IDS, RARE_BOSS_WEAPON_IDS, AI_PLAYER_PROFILES, ARENA_TIERS } from './state.js';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BIOME_STYLE = {
  forest: {
    top: 'grass', sub: 'dirt', rock: 'stone', arch: 'moss', prop: 'oak',
    scenery: ['grassTuft', 'grassTuft', 'bush', 'log', 'stump', 'stoneCluster'],
    dustColor: 0xfef08a, hazardColor: 0x22c55e, hazardEmissive: 0x15803d,
    enemyColors: [0x10b981, 0x059669, 0x047857],
  },
  beach: {
    top: 'sand', sub: 'sand', rock: 'stone', arch: 'dock', prop: 'palm',
    scenery: ['coral', 'coral', 'coral', 'stoneCluster', 'log', 'bush'],
    dustColor: 0xbae6fd, hazardColor: 0x38bdf8, hazardEmissive: 0x0284c7,
    enemyColors: [0x0ea5e9, 0x06b6d4, 0x0284c7],
  },
  desert: {
    top: 'sandstone', sub: 'redRock', rock: 'redRock', arch: 'sandstone', prop: 'cactus',
    scenery: ['stoneCluster', 'stoneCluster', 'log', 'crystal', 'bush'],
    dustColor: 0xfdba74, hazardColor: 0xf97316, hazardEmissive: 0xc2410c,
    enemyColors: [0xf59e0b, 0xd97706, 0xb45309],
  },
  dungeon: {
    top: 'obsidian', sub: 'obsidian', rock: 'obsidian', arch: 'rune', prop: 'torch',
    scenery: ['crystal', 'crystal', 'stoneCluster', 'torch'],
    dustColor: 0xd8b4fe, hazardColor: 0xef4444, hazardEmissive: 0x991b1b,
    enemyColors: [0x9333ea, 0xe11d48, 0x7e22ce],
  },
};

export function buildSafeHavenDef(saveState) {
  return {
    worldId: 'haven',
    levelNum: 0,
    isHaven: true,
    name: 'Grand Skybound Citadel (500p Safe Haven)',
    sky: '#6ec4ff',
    fog: '#bee6ff',
    dustColor: 0xffffff,
    spawn: [0, 1.2, 16.5],
    perimeterWalls: true,
    megaCastle: { x: 0, y: 0, z: -30 },
    fountain: { x: 0, y: 0.006, z: 6 },
    blacksmithForge: { x: -27.5, y: 0, z: 6 },
    shopStall: { x: 27.5, y: 0, z: 6 },
    saveShrine: { x: 14.5, y: 0, z: -7.5 },
    dummy: { x: -14.5, y: 0, z: 18.5 },
    islands: [
      // MASSIVE 144 x 144 Floating Cloud Continent (500-Multiplayer Ready Grand Citadel!)
      { x: 0, y: 0, z: 0, w: 144, d: 144, top: 'cloud', sub: 'cloudSub', rock: 'cloudSub' },
      // Puffy Outer Cloud Terraces cleanly outside ±72 (zero overlap / zero Z-fighting!)
      { x: -82, y: -1.4, z: 0,   w: 20, d: 64, top: 'cloud', sub: 'cloudSub', rock: 'cloudSub' },
      { x:  82, y: -1.4, z: 0,   w: 20, d: 64, top: 'cloud', sub: 'cloudSub', rock: 'cloudSub' },
      { x:   0, y: -1.5, z: -82, w: 68, d: 20, top: 'cloud', sub: 'cloudSub', rock: 'cloudSub' },
      { x:   0, y: -1.4, z:  82, w: 68, d: 20, top: 'cloud', sub: 'cloudSub', rock: 'cloudSub' },
      // ZERO-OVERLAP Sky-Marble Grand Plaza, Cross-Avenues & Realm Portal Spurs (strictly edge-to-edge = ZERO Z-fighting!)
      // Grand Central Plaza: X[-14, +14], Z[-8, +20]
      { x:   0,   y: 0.005, z:   6,   w: 28, d: 28, top: 'skyMarble', sub: 'cloudSub', rock: 'cloudSub', thin: true, layer: 2 },
      // North Castle Approach: X[-6, +6], Z[-13, -8]
      { x:   0,   y: 0.005, z: -10.5, w: 12, d:  5, top: 'skyMarble', sub: 'cloudSub', rock: 'cloudSub', thin: true, layer: 2 },
      // South Arena Avenue: X[-7, +7], Z[+20, +48]
      { x:   0,   y: 0.005, z:  34,   w: 14, d: 28, top: 'skyMarble', sub: 'cloudSub', rock: 'cloudSub', thin: true, layer: 2 },
      // West Avenue: X[-38, -14], Z[0, +12]
      { x: -26,   y: 0.005, z:   6,   w: 24, d: 12, top: 'skyMarble', sub: 'cloudSub', rock: 'cloudSub', thin: true, layer: 2 },
      // East Avenue: X[+14, +38], Z[0, +12]
      { x:  26,   y: 0.005, z:   6,   w: 24, d: 12, top: 'skyMarble', sub: 'cloudSub', rock: 'cloudSub', thin: true, layer: 2 },
      // 4 Exact-Fit Spur Walkways connecting Avenues (Z=0 / Z=12) right to the 4 Biome Gardens (Z=-14 / Z=17) — ZERO overlap!
      { x: -34,   y: 0.005, z:  14.5, w:  8, d:  5, top: 'skyMarble', sub: 'cloudSub', rock: 'cloudSub', thin: true, layer: 2 },
      { x:  34,   y: 0.005, z:  14.5, w:  8, d:  5, top: 'skyMarble', sub: 'cloudSub', rock: 'cloudSub', thin: true, layer: 2 },
      { x: -34,   y: 0.005, z:  -7,   w:  8, d: 14, top: 'skyMarble', sub: 'cloudSub', rock: 'cloudSub', thin: true, layer: 2 },
      { x:  34,   y: 0.005, z:  -7,   w:  8, d: 14, top: 'skyMarble', sub: 'cloudSub', rock: 'cloudSub', thin: true, layer: 2 },
      // 4 Lush Themed Garden Quadrants (strictly outside all avenues & spurs — ZERO overlap!):
      // SW Grass: X[-54, -30], Z[+17, +39] | SE Sand: X[+30, +54], Z[+17, +39]
      // NW Desert: X[-54, -30], Z[-38, -14] | NE Dungeon: X[+30, +54], Z[-38, -14]
      { x: -42, y: 0.005, z:  28, w: 24, d: 22, top: 'grass',     sub: 'dirt',    rock: 'stone',   thin: true, layer: 2 },
      { x:  42, y: 0.005, z:  28, w: 24, d: 22, top: 'sand',      sub: 'sand',    rock: 'stone',   thin: true, layer: 2 },
      { x: -42, y: 0.005, z: -26, w: 24, d: 24, top: 'sandstone', sub: 'redRock', rock: 'redRock', thin: true, layer: 2 },
      { x:  42, y: 0.005, z: -26, w: 24, d: 24, top: 'obsidian',  sub: 'obsidian',rock: 'obsidian',thin: true, layer: 2 },
    ],
    props: [
      // Grand Torchlight Braziers & Royal Banners lining the Castle Approach, Fountain & Arena Pavilion
      { kind: 'brazier', x: -7.2, y: 0.006, z: -9.5 },  { kind: 'brazier', x:  7.2, y: 0.006, z: -9.5 },
      { kind: 'brazier', x: -9.5, y: 0.006, z: 16.5 },  { kind: 'brazier', x:  9.5, y: 0.006, z: 16.5 },
      { kind: 'brazier', x: -7.5, y: 0.006, z: 39.5 },  { kind: 'brazier', x:  7.5, y: 0.006, z: 39.5 },
      { kind: 'banner',  x: -11.5, y: 0.006, z: -10.5, color: 0x2563eb },
      { kind: 'banner',  x:  11.5, y: 0.006, z: -10.5, color: 0x2563eb },
      { kind: 'banner',  x: -16.5, y: 0.006, z: 16.5,  color: 0xb91c1c },
      { kind: 'banner',  x:  16.5, y: 0.006, z: 16.5,  color: 0x0284c7 },
      { kind: 'banner',  x: -8.5,  y: 0.006, z: 44.0,  color: 0xb91c1c },
      { kind: 'banner',  x:  8.5,  y: 0.006, z: 44.0,  color: 0xb91c1c },
      // Notice Board, Campfire & Supply Crates for lived-in RPG atmosphere!
      { kind: 'noticeBoard', x: 20.5, y: 0.006, z: 16.5, rot: -0.45 },
      { kind: 'campfire',    x: -46.5, y: 0.006, z: 19.5 },
      { kind: 'barrelStack', x: -22.5, y: 0.006, z: 1.2 },
      { kind: 'barrelStack', x:  22.5, y: 0.006, z: 1.2 },
      // South-West Sky Forest Garden (framing the Sky Forest Portal at -35.5, 25.0)
      { kind: 'oak', x: -48, y: 0.006, z: 33 }, { kind: 'oak', x: -34, y: 0.006, z: 36 },
      { kind: 'log', x: -45, y: 0.006, z: 27 }, { kind: 'stump', x: -43, y: 0.006, z: 35 },
      { kind: 'stoneCluster', x: -50, y: 0.006, z: 24 }, { kind: 'bush', x: -39, y: 0.006, z: 36 },
      { kind: 'grassTuft', x: -43, y: 0.006, z: 22 }, { kind: 'grassTuft', x: -31, y: 0.006, z: 21 },
      // South-East Sky Beach Garden (framing the Sky Beach Portal at +35.5, 25.0)
      { kind: 'palm', x: 48, y: 0.006, z: 33 }, { kind: 'palm', x: 36, y: 0.006, z: 36 },
      { kind: 'coral', x: 44, y: 0.006, z: 23 }, { kind: 'coral', x: 49, y: 0.006, z: 27 },
      { kind: 'stoneCluster', x: 45, y: 0.006, z: 19 },
      // North-West Sky Desert Garden (framing the Sky Desert Portal at -38.5, -20.0)
      { kind: 'cactus', x: -48, y: 0.006, z: -29 }, { kind: 'cactus', x: -35, y: 0.006, z: -32 },
      { kind: 'stoneCluster', x: -48, y: 0.006, z: -20 },
      // North-East Sky Dungeon Garden (framing the Sky Dungeon Portal at +38.5, -20.0)
      { kind: 'crystal', x: 48, y: 0.006, z: -27 }, { kind: 'crystal', x: 35, y: 0.006, z: -31 },
      { kind: 'brazier', x: 47, y: 0.006, z: -19.5 },
      // Sky Lanterns framing the Grand Avenues
      { kind: 'lantern', x: -7.0, y: 0.006, z: 20 }, { kind: 'lantern', x: 7.0, y: 0.006, z: 20 },
      { kind: 'lantern', x: -16, y: 0.006, z: 0 },   { kind: 'lantern', x: 16, y: 0.006, z: 0 },
    ],
    pillars: [],
    jumpPads: [],
    movers: [],
    spikeTraps: [],
    spinners: [],
    crumbleBlocks: [],
    crushers: [],
    hazardZones: [],
    pendulums: [],
    turrets: [],
    // 5 Official Graphic-Artist Sculpted Portals placed in 5 Distinct Dedicated Realm Wings around Safe Haven!
    portals: [
      { worldId: 'forest',  label: 'SKY FOREST',  x: -35.5, y: 0, z:  25.0, rotY:  Math.PI * 0.68, color: 0x34d399, unlocked: true },
      { worldId: 'beach',   label: 'SKY BEACH',   x:  35.5, y: 0, z:  25.0, rotY: -Math.PI * 0.68, color: 0x22d3ee, unlocked: !!(saveState.unlockedWorlds.beach || saveState.previewAll) },
      { worldId: 'arena',   label: 'DUEL ARENA',  x:   0.0, y: 0, z:  43.5, rotY:  Math.PI,        color: 0xf43f5e, unlocked: true },
      { worldId: 'desert',  label: 'SKY DESERT',  x: -38.5, y: 0, z: -20.0, rotY:  Math.PI * 0.25, color: 0xfb923c, unlocked: !!(saveState.unlockedWorlds.desert || saveState.previewAll) },
      { worldId: 'dungeon', label: 'SKY DUNGEON', x:  38.5, y: 0, z: -20.0, rotY: -Math.PI * 0.25, color: 0xc084fc, unlocked: !!(saveState.unlockedWorlds.dungeon || saveState.previewAll) },
    ],
    // 5 Armed Hub NPCs positioned at their dedicated Castle Interior, Blacksmith Forge, Weapon Store, Guild & Arena Stations!
    npcs: [
      {
        id: 'elder', name: 'Elder Rowan', role: 'CASTLE QUEST HALL',
        x: 0, y: 0.02, z: -31.8, robeColor: 0x2563eb, hatColor: 0xfacc15, marker: '!',
        greeting: 'Welcome inside the Grand Skybound Citadel! Walk freely through our hall, inspect the Boss Relic Pedestal, and accept quests to restore Sky Forest, Sky Beach, Sky Dungeon & Sky Desert!',
      },
      {
        id: 'smith', name: 'Blacksmith Torin', role: 'WEAPON FORGE',
        x: -21.2, y: 0.008, z: 8.5, robeColor: 0xd97706, hatColor: 0x475569, marker: '!',
        greeting: 'Step up to my Forge & Anvil! Every weapon upgrade awakens a stronger voxel glow—Cyan, Emerald, Gold, Violet, up to Mythic Crimson!',
      },
      {
        id: 'merchant', name: 'Merchant Mira', role: 'WEAPON STORE',
        x: 21.2, y: 0.008, z: 8.5, robeColor: 0xe11d48, hatColor: 0xfef08a, marker: '$',
        greeting: 'Welcome to the Skybound Weapon & Gear Store! Buy Spears, Swords, Bows, Elemental Arrows, Battle Axes & sell extra bag loot right here.',
      },
      {
        id: 'guildmaster', name: 'Guild Master Kael', role: 'ALLIANCES',
        x: 17.5, y: 0.008, z: 18.5, robeColor: 0x0284c7, hatColor: 0x38bdf8, marker: '★',
        greeting: 'Unite with explorers! Create or join a Guild (up to 100 members) for permanent buffs & an AI Guildmate in the Duel Arena.',
      },
      {
        id: 'arenamaster', name: 'Champion Rex', role: 'DUEL ARENA',
        x: -17.5, y: 0.008, z: 18.5, robeColor: 0xbe123c, hatColor: 0xfacc15, marker: '⚔',
        greeting: 'Test your upgraded weapons on the training dummy beside me, then step through the Duel Arena Portal for 1v1 & Guild Skirmishes!',
      },
    ],
    roamingAiPlayers: AI_PLAYER_PROFILES.slice(0, 8).map((p, idx) => ({
      ...p,
      spawnX: [-14, 14, -20, 20, -8, 8, -4, 4][idx],
      spawnZ: [14, 14, -4, -4, 26, 26, -22, -24][idx],
    })),
    heartStones: [{ x: -11.5, y: 0, z: 18.5 }],
    enemies: [],
    chests: [],
    relic: null,
  };
}

// =========================================================================
// SKY ARENA COLOSSEUM (AI PvP Challengers + Guild Skirmish + Active Hazards!)
// =========================================================================
export function buildSkyArenaDef(tierNum = 1, saveState = null) {
  const tier = ARENA_TIERS[Math.max(0, Math.min(ARENA_TIERS.length - 1, (tierNum || 1) - 1))];
  const inGuild = !!(saveState && saveState.guild);
  const w = 40;
  const d = 40;

  // Build tactical AI Challengers from AI_PLAYER_PROFILES
  const enemies = tier.bots.map((profileIdx, idx) => {
    const prof = AI_PLAYER_PROFILES[profileIdx % AI_PLAYER_PROFILES.length];
    const isBoss = tier.tier === 4 && idx === 0;
    const spreadX = tier.bots.length === 1 ? 0 : (idx - (tier.bots.length - 1) / 2) * 8.5;
    const isRanged = prof.style === 'ranged';
    return {
      x: spreadX,
      y: 0,
      z: -11.5 - (idx % 2) * 2.5,
      type: isRanged ? 'archer' : 'brawler',
      isAiPlayer: true,
      isBoss,
      aiProfile: prof,
      displayName: `[${prof.tag}] ${prof.name}`,
      maxHp: Math.round(tier.baseHp * (isBoss ? 1.75 : 1.0)),
      coins: Math.round(14 + tier.tier * 6),
      bodyColor: prof.tunic,
      accentColor: prof.cape,
      patrolR: 16.5,
      dropWeapon: prof.weapon,
      weaponId: prof.weapon,
      weaponLvl: prof.weaponLvl,
      speed: (isBoss ? 5.6 : 4.9) + tier.tier * 0.28,
      fireRate: Math.max(0.65, 1.35 - tier.tier * 0.14),
    };
  });

  // In Tier 3+ (or any Arena match when in a Guild!), spawn an AI Guildmate Ally to fight alongside you!
  const allies = [];
  if (inGuild && tier.tier >= 3) {
    const g = saveState.guild;
    const allyName = (g.members && g.members.find((m) => m.name !== saveState.playerName)?.name) || 'Vanguard AI';
    allies.push({
      x: -4.2, y: 0, z: 11.0,
      displayName: `[${g.tag}] ${allyName}`,
      tunic: 0x0284c7, cape: 0x38bdf8, skin: 0xffd1a9, hair: 0xfacc15, hatColor: 0x38bdf8,
      weapon: 'storm_bow', weaponLvl: Math.min(6, 2 + (g.level || 1)),
      maxHp: Math.round(tier.baseHp * 1.15),
      damage: Math.round(18 + tier.tier * 7 + (g.level || 1) * 4),
      speed: 5.4,
    });
  }

  return {
    worldId: 'arena',
    levelNum: tier.tier,
    isHaven: false,
    isArena: true,
    arenaTier: tier,
    name: `Sky Arena · ${tier.name}`,
    sky: '#3c1e5a',
    fog: '#6d3c96',
    dustColor: 0xfda4af,
    spawn: [0, 1.2, 13.5],
    islands: [
      // Grand 40 x 40 Sky Colosseum Fighting Floor
      { x: 0, y: 0, z: 0, w, d, top: 'skyMarble', sub: 'obsidian', rock: 'obsidian' },
      // ZERO-OVERLAP Gold-Trimmed Center Ring (4 non-overlapping gold border strips around 12x12 ruin center = ZERO Z-fighting!)
      { x:  0, y: 0.005, z: -7, w: 16, d:  2, top: 'gold', sub: 'obsidian', rock: 'obsidian', thin: true, layer: 2 },
      { x:  0, y: 0.005, z:  7, w: 16, d:  2, top: 'gold', sub: 'obsidian', rock: 'obsidian', thin: true, layer: 2 },
      { x: -7, y: 0.005, z:  0, w:  2, d: 12, top: 'gold', sub: 'obsidian', rock: 'obsidian', thin: true, layer: 2 },
      { x:  7, y: 0.005, z:  0, w:  2, d: 12, top: 'gold', sub: 'obsidian', rock: 'obsidian', thin: true, layer: 2 },
      { x:  0, y: 0.005, z:  0, w: 12, d: 12, top: 'ruin', sub: 'obsidian', rock: 'obsidian', thin: true, layer: 2 },
      // Elevated Spectator Bleacher Terraces cleanly outside ±20
      { x: -24.5, y: 2.2, z: 0, w: 6, d: 34, top: 'cloud', sub: 'cloudSub', rock: 'cloudSub' },
      { x: 24.5,  y: 2.2, z: 0, w: 6, d: 34, top: 'cloud', sub: 'cloudSub', rock: 'cloudSub' },
      { x: 0,     y: 2.2, z: -24.5, w: 38, d: 6, top: 'cloud', sub: 'cloudSub', rock: 'cloudSub' },
    ],
    props: [
      { kind: 'brazier', x: -17, y: 0, z: -17 }, { kind: 'brazier', x: 17, y: 0, z: -17 },
      { kind: 'brazier', x: -17, y: 0, z: 17 },  { kind: 'brazier', x: 17, y: 0, z: 17 },
      { kind: 'banner',  x: -18.2, y: 0, z: -9, color: 0xb91c1c }, { kind: 'banner', x: 18.2, y: 0, z: -9, color: 0xb91c1c },
      { kind: 'banner',  x: -18.2, y: 0, z:  9, color: 0xf59e0b }, { kind: 'banner', x: 18.2, y: 0, z:  9, color: 0xf59e0b },
      { kind: 'crystal', x: -15, y: 0, z: 0 }, { kind: 'crystal', x: 15, y: 0, z: 0 },
      { kind: 'lantern', x: -10, y: 0, z: 17 }, { kind: 'lantern', x: 10, y: 0, z: 17 },
      { kind: 'lantern', x: -10, y: 0, z: -17 }, { kind: 'lantern', x: 10, y: 0, z: -17 },
    ],
    pillars: [
      // 4 Tactical Cover Pillars inside the Arena for dodging AI projectiles!
      [-9.5, 0, -6.5, 4.2, 'skyMarble'], [9.5, 0, -6.5, 4.2, 'skyMarble'],
      [-9.5, 0, 6.5, 4.2, 'skyMarble'],  [9.5, 0, 6.5, 4.2, 'skyMarble'],
    ],
    jumpPads: [
      [-15.5, 0, 12.0, 16.5], [15.5, 0, 12.0, 16.5],
      [-15.5, 0, -12.0, 16.5], [15.5, 0, -12.0, 16.5],
    ],
    movers: [],
    spikeTraps: [
      { x: -11.5, y: 0, z: 0, w: 2.8, d: 2.8, period: 3.0, phase: 0.4 },
      { x: 11.5,  y: 0, z: 0, w: 2.8, d: 2.8, period: 3.0, phase: 1.9 },
    ],
    spinners: tier.tier >= 2 ? [
      { x: 0, y: 0, z: 0, radius: 4.0, speed: 1.45 + tier.tier * 0.22, phase: 0 },
    ] : [],
    crumbleBlocks: [],
    crushers: [],
    hazardZones: tier.tier >= 3 ? [
      { x: -14.5, y: 0, z: -6.5, w: 3.2, d: 3.2, color: 0xef4444, emissive: 0x991b1b },
      { x: 14.5,  y: 0, z: -6.5, w: 3.2, d: 3.2, color: 0xef4444, emissive: 0x991b1b },
    ] : [],
    pendulums: [],
    turrets: [],
    portals: [],
    npcs: [],
    roamingAiPlayers: [],
    heartStones: [
      { x: -15.5, y: 0, z: 0 },
      { x: 15.5, y: 0, z: 0 },
    ],
    enemies,
    allies,
    chests: [],
    relic: null,
  };
}

export function generateBiomeLevel(worldId, levelNum) {
  const meta = WORLD_META[worldId] || WORLD_META.forest;
  const style = BIOME_STYLE[worldId] || BIOME_STYLE.forest;
  const rng = mulberry32(meta.order * 100003 + levelNum * 7919 + 42);

  // Unique Evocative World Titles & Time-of-Day Atmosphere Variations for ALL 400 Levels!
  const ADJ = ['Dawnbreak','Whispering','Sunlit','Verdant','Shattered','Gilded','Windborne','Cloudcrest','Starfall','Highspire','Mossveil','Driftstone','Amber','Crystal','Aether','Skyward','Silver','Radiant','Mistbound','Runic'];
  const LMK = ['Sanctuary','Crossing','Orchard','Ramparts','Citadel','Terrace','Keep','Archipelago','Hollow','Outpost','Gardens','Causeway','Spire','Courtyard','Overlook','Bastion','Haven','Vault','Labyrinth','Summit'];
  const SKY_MOODS = [
    null,
    { sky: '#60a5fa', fog: '#fde68a' }, // Dawn Mist
    { sky: '#38bdf8', fog: '#bae6fd' }, // Crisp Noon
    { sky: '#ea580c', fog: '#fde68a' }, // Golden Hour
    { sky: '#6d28d9', fog: '#c084fc' }, // Twilight Glow
    { sky: '#0f172a', fog: '#2dd4bf' }, // Aurora Starlight
  ];
  const uniqueTitle = `${ADJ[((levelNum - 1) * 7 + meta.order * 3) % ADJ.length]} ${LMK[((levelNum - 1) * 11 + meta.order * 5) % LMK.length]}`;
  const mood = worldId === 'dungeon' ? null : SKY_MOODS[(levelNum - 1) % SKY_MOODS.length];

  const isBossLevel = levelNum % 10 === 0;
  const isChestLevel = levelNum % 25 === 0;
  // Deeper multi-stage Big-World RPG levels (5 to 7 huge interconnected islands!)
  const islandCount = isBossLevel ? 5 : (levelNum <= 10 ? 5 : levelNum <= 40 ? 6 : 7);

  const islands = [];
  const props = [];
  const pillars = [];
  const jumpPads = [];
  const movers = [];
  const spikeTraps = [];
  const spinners = [];
  const crumbleBlocks = [];
  const crushers = [];
  const hazardZones = [];
  const pendulums = [];
  const turrets = [];
  const enemies = [];
  const chests = [];
  const heartStones = [];

  // EXTRA WIDE Start Spawn Island (18 x 18!) decorated with biome nature!
  let cx = 0;
  let cy = 0;
  let cz = 0;
  let prevW = 18;
  let prevD = 18;

  islands.push({ x: cx, y: cy, z: cz, w: prevW, d: prevD, top: style.top, sub: style.sub, rock: style.rock });
  props.push({ kind: style.prop, x: cx - 6.8, y: cy, z: cz + 6.2 });
  props.push({ kind: style.prop, x: cx + 6.8, y: cy, z: cz + 6.2 });
  props.push({ kind: style.scenery[0], x: cx - 5.2, y: cy, z: cz - 5.0 });
  props.push({ kind: style.scenery[1 % style.scenery.length], x: cx + 5.6, y: cy, z: cz - 4.8 });
  props.push({ kind: style.scenery[3 % style.scenery.length], x: cx - 6.6, y: cy, z: cz + 0.5 });
  props.push({ kind: style.scenery[2 % style.scenery.length], x: cx + 6.8, y: cy, z: cz + 1.2 });

  // Enemy HP & Owner-Fair Credit Coin scaling across all 400 levels
  const worldScale = 1 + (meta.order - 1) * 1.45;
  const levelScale = 1 + (levelNum - 1) * 0.06;
  const baseEnemyHp = Math.round(46 * worldScale * levelScale);
  const baseCoinReward = Math.round((8 + (meta.order - 1) * 7) * (1 + (levelNum - 1) * 0.024));
  const trapSpeedScale = 1 + (meta.order - 1) * 0.16 + Math.min(0.45, levelNum * 0.0045);

  const poolIndexMax = Math.min(LOOT_WEAPON_IDS.length, 2 + meta.order + Math.floor(levelNum / 20));
  const dropPool = LOOT_WEAPON_IDS.slice(0, Math.max(3, poolIndexMax));

  let chestIslandRef = null;
  let prevDirX = 0;

  for (let i = 1; i <= islandCount; i++) {
    const isFinal = i === islandCount;
    // EVEN WIDER Battleground Islands (24x20 up to 30x24!) for lush scenery + rich obstacle gauntlets!
    const w = isFinal ? (isBossLevel ? 30 : 27) : (24 + Math.floor(rng() * 4));
    const d = isFinal ? (isBossLevel ? 24 : 22) : (20 + Math.floor(rng() * 4));

    const dirRoll = rng();
    let dirX = 0;
    let dirZ = -1;
    if (prevDirX === 0 && i > 1 && i < islandCount) {
      if (dirRoll < 0.30) { dirX = -1; dirZ = 0; }
      else if (dirRoll > 0.70) { dirX = 1; dirZ = 0; }
    }
    prevDirX = dirX;

    const useMover = !isFinal && (i === 3 || rng() < 0.34);
    const useCrumble = !useMover && (i === 2 || rng() < 0.44);
    const useJumpPad = !useMover && !useCrumble && rng() < 0.45;
    const gap = useMover ? 11.2 : useCrumble ? 11.6 : 7.8;
    const rise = useJumpPad ? 3.0 : (1.1 + rng() * 0.75);

    const stepDist = (dirZ !== 0 ? (prevD / 2 + d / 2) : (prevW / 2 + w / 2)) + gap;
    const nx = cx + dirX * stepDist;
    const ny = cy + rise;
    const nz = cz + dirZ * stepDist;

    const midX = cx + dirX * ((dirZ !== 0 ? prevD / 2 : prevW / 2) + gap * 0.5);
    const midZ = cz + dirZ * ((dirZ !== 0 ? prevD / 2 : prevW / 2) + gap * 0.5);

    if (useMover) {
      const mStartX = cx + dirX * ((dirZ !== 0 ? prevD / 2 : prevW / 2) + 2.9);
      const mStartZ = cz + dirZ * ((dirZ !== 0 ? prevD / 2 : prevW / 2) + 2.9);
      const mEndX = nx - dirX * ((dirZ !== 0 ? d / 2 : w / 2) + 2.9);
      const mEndZ = nz - dirZ * ((dirZ !== 0 ? d / 2 : w / 2) + 2.9);
      movers.push({ x1: mStartX, y1: cy + 0.3, z1: mStartZ, x2: mEndX, y2: ny - 0.1, z2: mEndZ, w: 5.4, d: 5.4, speed: (0.85 + Math.min(0.45, levelNum * 0.005)) * trapSpeedScale });
    } else if (useCrumble) {
      const c1X = cx + dirX * ((dirZ !== 0 ? prevD / 2 : prevW / 2) + gap * 0.28);
      const c1Z = cz + dirZ * ((dirZ !== 0 ? prevD / 2 : prevW / 2) + gap * 0.28);
      const c2X = cx + dirX * ((dirZ !== 0 ? prevD / 2 : prevW / 2) + gap * 0.72);
      const c2Z = cz + dirZ * ((dirZ !== 0 ? prevD / 2 : prevW / 2) + gap * 0.72);
      crumbleBlocks.push({ x: c1X, y: cy + rise * 0.35, z: c1Z, w: 3.8, d: 3.8 });
      crumbleBlocks.push({ x: c2X, y: cy + rise * 0.72, z: c2Z, w: 3.8, d: 3.8 });
    } else if (useJumpPad) {
      const padX = cx + dirX * ((dirZ !== 0 ? prevD / 2 : prevW / 2) - 2.2);
      const padZ = cz + dirZ * ((dirZ !== 0 ? prevD / 2 : prevW / 2) - 2.2);
      jumpPads.push([padX, cy, padZ, 18.6]);
      islands.push({ x: midX, y: cy + rise * 0.55, z: midZ, w: 5.6, d: 5.6, top: style.arch, sub: style.sub, rock: style.rock });
    } else {
      islands.push({ x: midX, y: cy + rise * 0.5, z: midZ, w: 5.8, d: 5.8, top: style.arch, sub: style.sub, rock: style.rock });
    }

    const isCheckpoint = (i === 2) || (i === 4 && islandCount >= 5) || (isFinal && islandCount >= 5);
    islands.push({
      x: nx, y: ny, z: nz, w, d,
      top: isFinal && isBossLevel ? 'gold' : style.top,
      sub: style.sub,
      rock: style.rock,
      checkpoint: isCheckpoint ? `${meta.short} CP${i}` : null,
    });

    if (i === Math.max(2, islandCount - 1)) {
      chestIslandRef = { x: nx, y: ny, z: nz, w, d, incomingDirX: dirX };
    }
    // Place gleaming 1UP Heart Stones on key battle islands (mid-run & final island!)
    if (i === 2 || i === 4 || isFinal) {
      const hsSide = i % 2 === 0 ? -1 : 1;
      heartStones.push({ x: nx + hsSide * (w * 0.24), y: ny, z: nz + d * 0.24 });
    }

    // LUSH BIOME SCENERY, LANDMARK BUILDINGS, BRICK WALLS, BRAZIERS & CAMPFIRES ON EVERY WIDE ISLAND (ZERO OVERLAP!)
    if (i === 1) {
      props.push({ kind: 'campfire', x: nx - w * 0.34, y: ny, z: nz + d * 0.30 });
    }
    const hasLandmark = i === Math.ceil(islandCount / 2) || isFinal;
    const landmarkSide = i % 2 === 0 ? -1 : 1;
    if (hasLandmark) {
      // Iconic Per-World HD Landmark Building cleanly clear of corner trees & braziers!
      props.push({ kind: 'worldLandmark', x: nx + landmarkSide * (w * 0.34), y: ny, z: nz - d * 0.32 });
    }
    // Staggered Brick Walls with Mounted Blazing Torches & Braziers framing battle arenas!
    props.push({ kind: 'stoneWall', x: nx - w * 0.43, y: ny, z: nz, rot: Math.PI / 2 });
    props.push({ kind: 'stoneWall', x: nx + w * 0.43, y: ny, z: nz, rot: -Math.PI / 2 });
    if (!hasLandmark || landmarkSide > 0) {
      props.push({ kind: 'brazier',   x: nx - w * 0.36, y: ny, z: nz - d * 0.35 });
      props.push({ kind: style.prop,  x: nx - w * 0.43, y: ny, z: nz - d * 0.41 });
    }
    if (!hasLandmark || landmarkSide < 0) {
      props.push({ kind: style.prop,  x: nx + w * 0.42, y: ny, z: nz - d * 0.40 });
    }
    props.push({ kind: 'brazier',   x: nx + w * 0.36, y: ny, z: nz + d * 0.35 });
    props.push({ kind: style.prop,  x: nx + w * 0.43, y: ny, z: nz + d * 0.40 });
    props.push({ kind: style.prop,  x: nx - w * 0.42, y: ny, z: nz + d * 0.38 });

    // Rich perimeter & pocket nature props (grass tufts, corals, fallen logs, tree stumps, stone clusters, crystals)
    const propCount = 10;
    for (let pIdx = 0; pIdx < propCount; pIdx++) {
      const ang = (pIdx / propCount) * Math.PI * 2 + rng() * 0.4;
      const rx = (0.31 + rng() * 0.12) * w;
      const rz = (0.30 + rng() * 0.12) * d;
      const px = nx + Math.cos(ang) * rx;
      const pz = nz + Math.sin(ang) * rz;
      // Keep clear of checkpoint (z + d*0.35) and Relic (z - d*0.38)
      if (Math.abs(px - nx) < 3.0 && Math.abs(pz - (nz + d * 0.35)) < 2.8) continue;
      if (isFinal && Math.abs(px - nx) < 3.2 && Math.abs(pz - (nz - d * 0.38)) < 3.0) continue;
      const kind = style.scenery[Math.floor(rng() * style.scenery.length)];
      props.push({ kind, x: px, y: ny, z: pz, rot: rng() * Math.PI * 2 });
    }

    pillars.push([nx - w * 0.34, ny, nz, 4.0, style.arch]);
    pillars.push([nx + w * 0.34, ny, nz, 4.0, style.arch]);

    // 7 ACTIVE 3D OBSTACLE TYPES ON GUARANTEED NON-OVERLAPPING LANES (ZERO Z-FIGHTING!)
    // 1. Pop-Up Spike Traps (cleanly separated from hazard pools, pillars & pendulums!)
    const spikeOffX = Math.min(7.4, w * 0.30);
    spikeTraps.push({
      x: nx - spikeOffX, y: ny, z: nz - 1.2, w: 2.4, d: 2.4,
      period: Math.max(2.0, 3.1 / trapSpeedScale), phase: i * 0.9,
    });
    spikeTraps.push({
      x: nx + spikeOffX, y: ny, z: nz - 1.2, w: 2.4, d: 2.4,
      period: Math.max(2.0, 3.1 / trapSpeedScale), phase: i * 0.9 + 1.2,
    });
    spikeTraps.push({
      x: nx + (i % 2 === 0 ? -7.2 : 7.2), y: ny, z: nz + d * 0.28, w: 2.4, d: 2.4,
      period: Math.max(2.0, 3.1 / trapSpeedScale), phase: i * 0.9 + 2.2,
    });

    // 2. Spinning Blade Sweeper Totems (1-2 per wide island!)
    spinners.push({
      x: nx, y: ny, z: nz - (isFinal ? -0.4 : 0.6),
      radius: isFinal ? 4.4 : 3.6,
      speed: (1.55 + Math.min(0.9, meta.order * 0.18 + levelNum * 0.008)) * (i % 2 === 0 ? -1 : 1),
      phase: rng() * Math.PI * 2,
    });
    if (i >= 3 || isFinal) {
      spinners.push({
        x: nx + (i % 2 === 0 ? 5.6 : -5.6), y: ny, z: nz - 5.2,
        radius: 2.9,
        speed: (1.85 + Math.min(0.7, levelNum * 0.006)) * (i % 2 === 0 ? 1 : -1),
        phase: rng() * Math.PI * 2,
      });
    }

    // 3. Swinging Pendulum Axes hanging across wide lanes!
    if (i === 1 || i % 2 === 0 || isFinal) {
      pendulums.push({
        x: nx, y: ny, z: nz + d * 0.20,
        height: 5.4,
        armLen: 4.1,
        maxAngle: 0.95,
        speed: 1.85 + Math.min(0.75, meta.order * 0.14 + levelNum * 0.006),
        phase: i * 1.3,
      });
    }

    // 4. Sliding Crusher / Pusher Hazard Blocks (clean lane at z = nz - d*0.24)
    if (i >= 1) {
      const span = Math.min(6.4, w * 0.25);
      crushers.push({
        x1: nx - span, y1: ny, z1: nz - d * 0.24,
        x2: nx + span, y2: ny, z2: nz - d * 0.24,
        w: 2.2, h: 2.1, d: 2.2,
        speed: 1.3 + Math.min(0.85, meta.order * 0.15 + levelNum * 0.007),
        phase: i * 0.9,
      });
    }

    // 5. Biome Floor Hazard Zones (strictly separated from spikes, crushers & pendulums!)
    const hzSide = i % 2 === 0 ? -1 : 1;
    hazardZones.push({
      x: nx + hzSide * (w * 0.28), y: ny, z: nz - d * 0.34,
      w: 3.4, d: 2.6,
      color: style.hazardColor, emissive: style.hazardEmissive,
    });
    if (i >= 2 || meta.order >= 2) {
      hazardZones.push({
        x: nx - hzSide * (w * 0.29), y: ny, z: nz + d * 0.12,
        w: 3.2, d: 2.4,
        color: style.hazardColor, emissive: style.hazardEmissive,
      });
    }

    // 6. Rune Energy Turret Pylons firing periodic energy orbs across arenas!
    if (i >= 2 || isFinal) {
      const tSide = i % 2 === 0 ? -1 : 1;
      turrets.push({
        x: nx + tSide * (w * 0.36), y: ny, z: nz - 0.5,
        dirX: -tSide, dirZ: 0,
        interval: Math.max(1.7, 2.8 / trapSpeedScale),
        speed: 10.5 + meta.order * 1.1,
        range: w * 0.72,
        phase: i * 0.7,
        color: style.hazardColor,
      });
    }

    // Multiple NPCs spread generously across the extra-wide island
    const countHere = isFinal
      ? (isBossLevel ? 5 : 4 + Math.min(2, Math.floor(levelNum / 30)))
      : (3 + Math.min(2, Math.floor((levelNum + 10) / 30)));

    for (let eIdx = 0; eIdx < countHere; eIdx++) {
      const isBoss = isFinal && isBossLevel && eIdx === 0;
      const angle = (eIdx / countHere) * Math.PI * 2 + rng() * 0.6;
      const radX = isBoss ? 0 : Math.min(w * 0.33, 5.0 + rng() * 3.5);
      const radZ = isBoss ? -2.2 : Math.min(d * 0.29, 3.8 + rng() * 2.8);
      const ex = nx + Math.cos(angle) * radX;
      const ez = nz + Math.sin(angle) * radZ;

      const isRanged = isBoss ? (levelNum % 20 === 0) : (rng() < 0.45);
      const dropWeapon = isBoss
        ? RARE_BOSS_WEAPON_IDS[(meta.order + Math.floor(levelNum / 10)) % RARE_BOSS_WEAPON_IDS.length]
        : dropPool[Math.floor(rng() * dropPool.length)];
      const hpMult = isBoss ? 2.4 : (0.95 + rng() * 0.35);

      enemies.push({
        x: ex, y: ny, z: ez,
        type: isRanged ? 'archer' : 'brawler',
        isBoss,
        maxHp: Math.round(baseEnemyHp * hpMult),
        coins: isBoss ? baseCoinReward * 4 : baseCoinReward,
        bodyColor: style.enemyColors[eIdx % style.enemyColors.length],
        accentColor: isBoss ? 0xfacc15 : 0xe2e8f0,
        patrolR: Math.min(w, d) * 0.34,
        dropWeapon,
        speed: (isBoss ? 3.4 : 2.7 + Math.min(1.6, meta.order * 0.3 + levelNum * 0.012)),
        fireRate: Math.max(0.82, 1.8 - meta.order * 0.14 - levelNum * 0.004),
      });
    }

    cx = nx; cy = ny; cz = nz;
    prevW = w; prevD = d;
  }

  // Every 25th level (25, 50, 75, 100): HIDDEN CHEST on open unobstructed side!
  if (isChestLevel && chestIslandRef) {
    const side = chestIslandRef.incomingDirX === 1 ? 1 : (chestIslandRef.incomingDirX === -1 ? -1 : (rng() < 0.5 ? -1 : 1));
    const chX = chestIslandRef.x + side * (chestIslandRef.w * 0.5 + 6.0);
    const chY = chestIslandRef.y + 1.8;
    const chZ = chestIslandRef.z;
    islands.push({ x: chX, y: chY, z: chZ, w: 7.0, d: 7.0, top: 'gold', sub: style.sub, rock: style.rock });
    jumpPads.push([chestIslandRef.x + side * (chestIslandRef.w * 0.40), chestIslandRef.y, chestIslandRef.z, 16.0]);
    const rewardWeapon = RARE_BOSS_WEAPON_IDS[(meta.order + Math.floor(levelNum / 25)) % RARE_BOSS_WEAPON_IDS.length];
    chests.push({ id: `${worldId}-${levelNum}`, x: chX, y: chY, z: chZ, rewardWeapon, bonusCredits: 90 + meta.order * 35 });
  }

  const relic = { x: cx, y: cy + 1.7, z: cz - prevD * 0.40, title: `${uniqueTitle} (Lv.${levelNum})`, sealed: true };

  return {
    worldId, levelNum, isHaven: false, isBossLevel, isChestLevel,
    name: `${meta.name} ${levelNum} · ${uniqueTitle}`,
    sky: mood ? mood.sky : meta.sky,
    fog: mood ? mood.fog : meta.fog,
    dustColor: style.dustColor,
    spawn: [0, 1.2, 4.5],
    islands, props, pillars, jumpPads, movers,
    spikeTraps, spinners, crumbleBlocks, crushers, hazardZones, pendulums, turrets,
    portals: [], npcs: [],
    heartStones,
    enemies, chests, relic,
  };
}
