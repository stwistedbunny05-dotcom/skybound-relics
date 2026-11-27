// Grand Cloud Safe Haven Citadel + Sky Arena Colosseum + Extra-Wide 400-Level Seeded Biome Generator
import { WORLD_META, DIFFICULTY_TIERS, LOOT_WEAPON_IDS, RARE_BOSS_WEAPON_IDS, AI_PLAYER_PROFILES, ARENA_TIERS } from './state.js';

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
    scenery: ['flamingGrass', 'flamingGrass', 'stoneCluster', 'log', 'crystal', 'bush'],
    dustColor: 0xfdba74, hazardColor: 0xf97316, hazardEmissive: 0xc2410c,
    enemyColors: [0xf59e0b, 0xd97706, 0xb45309],
  },
  dungeon: {
    top: 'obsidian', sub: 'obsidian', rock: 'obsidian', arch: 'rune', prop: 'torch',
    scenery: ['flamingGrass', 'flamingGrass', 'crystal', 'stoneCluster', 'torch'],
    dustColor: 0xd8b4fe, hazardColor: 0xef4444, hazardEmissive: 0x991b1b,
    enemyColors: [0x9333ea, 0xe11d48, 0x7e22ce],
  },
};

// 20 Verified wide-open Safe Haven spawn spots (strictly clear of Fountain, Ponds, Castle Walls, Forge, Store & Portals!)
export const SAFE_HAVEN_SPAWN_POINTS = [
  [-16, 1.2, 18], [16, 1.2, 18], [-10, 1.2, 22], [10, 1.2, 22], [0, 1.2, 19],
  [-18, 1.2, 8],  [18, 1.2, 8],  [-14, 1.2, 2],  [14, 1.2, 2],  [-6, 1.2, 14],
  [6, 1.2, 14],   [-12, 1.2, 26],[12, 1.2, 26],  [-16, 1.2, -10],[16, 1.2, -10],
  [-8, 1.2, -12], [8, 1.2, -12], [-22, 1.2, 16], [22, 1.2, 16], [0, 1.2, 28],
];

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
      { kind: 'flamingGrass', x: -34, y: 0.006, z: -18, style: 'fire' },
      { kind: 'flamingGrass', x: -43, y: 0.006, z: -28, style: 'fire' },
      { kind: 'flamingGrass', x: -24.5, y: 0.006, z: 9.8, style: 'fire' },
      { kind: 'flamingGrass', x: -31.8, y: 0.006, z: 3.2, style: 'fire' },
      // North-East Sky Dungeon Garden (framing the Sky Dungeon Portal at +38.5, -20.0)
      { kind: 'crystal', x: 48, y: 0.006, z: -27 }, { kind: 'crystal', x: 35, y: 0.006, z: -31 },
      { kind: 'flamingGrass', x: 34, y: 0.006, z: -18, style: 'soul' },
      { kind: 'flamingGrass', x: 43, y: 0.006, z: -28, style: 'soul' },
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
      maxHp: Math.round(tier.baseHp * (isBoss ? 3.5 : 1.0)),
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
      { kind: 'flamingGrass', x: -15.2, y: 0, z: -15.2, style: 'fire' }, { kind: 'flamingGrass', x: 15.2, y: 0, z: -15.2, style: 'fire' },
      { kind: 'flamingGrass', x: -15.2, y: 0, z:  15.2, style: 'fire' }, { kind: 'flamingGrass', x: 15.2, y: 0, z:  15.2, style: 'fire' },
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
    hazardZones: [
      { x: -14.5, y: 0, z: -6.5, w: 3.2, d: 3.2, color: 0xef4444, emissive: 0x991b1b },
      { x: 14.5,  y: 0, z: -6.5, w: 3.2, d: 3.2, color: 0xef4444, emissive: 0x991b1b },
    ],
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

export function generateBiomeLevel(worldId, levelNum, diffTier = 0) {
  const meta = WORLD_META[worldId] || WORLD_META.forest;
  const style = BIOME_STYLE[worldId] || BIOME_STYLE.forest;
  const diff = DIFFICULTY_TIERS[Math.max(0, Math.min(2, diffTier || 0))] || DIFFICULTY_TIERS[0];
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
  // Seeded random Sky Spiral Ascent Tower stages across ALL 4 worlds (~30% of levels per world, unique mix per world!)
  const spiralRng = mulberry32(meta.order * 91813 + levelNum * 4999 + 777);
  const isSpiralLevel = (worldId === 'forest' && levelNum === 2) || (levelNum > 1 && spiralRng() < 0.30);
  const spiralDir = spiralRng() < 0.5 ? 1 : -1;
  const spiralStepCount = [12, 14, 16][Math.floor(spiralRng() * 3)];
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

  // Spatial footprint allocator: guarantees ZERO over-layered / overlapping assets across ALL 400 levels!
  const PROP_HALF = {
    oak: [1.55, 1.55],
    palm: [1.45, 1.45],
    cactus: [1.35, 1.15],
    torch: [0.85, 0.85],
    grassTuft: [0.65, 0.65],
    bush: [1.05, 1.05],
    log: [1.55, 1.55],
    stump: [0.85, 0.85],
    stoneCluster: [1.35, 1.35],
    coral: [1.15, 1.15],
    crystal: [1.05, 1.05],
    flamingGrass: [1.05, 1.05],
    brazier: [1.05, 1.05],
    campfire: [1.45, 1.35],
    stoneWall: [2.45, 0.90],
    worldLandmark: [3.45, 3.45],
    spiralSpire: [1.95, 1.95],
  };

  function overlapsZones(zones, x, z, hw, hd, pad = 0.45) {
    const aMinX = x - hw - pad, aMaxX = x + hw + pad;
    const aMinZ = z - hd - pad, aMaxZ = z + hd + pad;
    for (const b of zones) {
      if (aMaxX > b.minX && aMinX < b.maxX && aMaxZ > b.minZ && aMinZ < b.maxZ) return true;
    }
    return false;
  }

  function reserveZone(zones, x, z, hw, hd) {
    zones.push({ minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd });
  }

  function tryPlaceProp(zones, isl, p, pad = 0.42) {
    const base = PROP_HALF[p.kind] || [1.1, 1.1];
    const rot = p.rot || 0;
    const swap = p.kind === 'stoneWall' && Math.abs(Math.sin(rot)) > 0.5;
    const hw = swap ? base[1] : base[0];
    const hd = swap ? base[0] : base[1];
    // Stay cleanly inside the island bounds so props never dangle off edges!
    if (
      p.x - hw < isl.x - isl.w * 0.5 + 0.25 ||
      p.x + hw > isl.x + isl.w * 0.5 - 0.25 ||
      p.z - hd < isl.z - isl.d * 0.5 + 0.25 ||
      p.z + hd > isl.z + isl.d * 0.5 - 0.25
    ) {
      return false;
    }
    if (overlapsZones(zones, p.x, p.z, hw, hd, pad)) return false;
    props.push(p);
    reserveZone(zones, p.x, p.z, hw, hd);
    return true;
  }

  // PASS 1: Pre-plan all island positions, bridges, movers, crumble blocks & Tornado Jump Pads FIRST
  // so every island knows its exact entry/exit Jump Pad footprints BEFORE placing any trap or prop!
  const islandSpecs = [];
  let cx = 0;
  let cy = 0;
  let cz = 0;
  let prevW = isSpiralLevel ? 24 : 18;
  let prevD = isSpiralLevel ? 24 : 18;

  islandSpecs.push({
    idx: 0, x: cx, y: cy, z: cz, w: prevW, d: prevD,
    isFinal: false, isCheckpoint: false,
    incomingDirX: 0, incomingDirZ: 0,
    outgoingJumpPad: null, chestJumpPad: null,
  });
  islands.push({ x: cx, y: cy, z: cz, w: prevW, d: prevD, top: style.top, sub: style.sub, rock: style.rock });

  // Sky Spiral Platform Ascent Tower rising directly above the 24x24 Start Island!
  // Slip off any upper step and you tumble straight back down to lower steps or all the way to Start (y = 0)!
  if (isSpiralLevel) {
    const spiralRadius = 6.4;
    const stepCount = spiralStepCount;
    const stepRise = stepCount === 12 ? 1.06 : stepCount === 16 ? 0.90 : 0.98;
    const spiralTopY = 1.05 + (stepCount - 1) * stepRise;
    props.push({ kind: 'spiralSpire', x: 0, y: 0, z: 0, height: spiralTopY + 1.8 });
    for (let s = 0; s < stepCount; s++) {
      // 1.5 full helical turns (0 -> ±3*PI): Step 0 starts South (+6.4) in front of spawn; Top step ALWAYS exits North (-6.4) facing Battle Island #1!
      const ang = spiralDir * (s / (stepCount - 1)) * (Math.PI * 3);
      const sx = Math.sin(ang) * spiralRadius;
      const sz = Math.cos(ang) * spiralRadius;
      const sy = 1.05 + s * stepRise;
      const isTopStep = s === stepCount - 1;
      const sw = isTopStep ? 4.4 : 3.8;
      const sd = isTopStep ? 4.4 : 3.8;
      islands.push({
        x: sx, y: sy, z: sz, w: sw, d: sd,
        top: isTopStep ? 'gold' : style.top,
        sub: style.sub,
        rock: style.rock,
        spiralStep: true,
        stepIdx: s,
        isSpiralTop: isTopStep,
      });
    }
    // Launch Battle Island #1 cleanly from the top of the Spiral Summit (0, spiralTopY, -6.4)!
    cx = 0;
    cy = spiralTopY;
    cz = -spiralRadius;
    prevW = 4.4;
    prevD = 4.4;
  }

  // Enemy HP, Difficulty Scaling & Owner-Fair Credit Coin scaling across all 400 levels
  const worldScale = 1 + (meta.order - 1) * 1.45;
  const levelScale = 1 + (levelNum - 1) * 0.06;
  const baseEnemyHp = Math.round(48 * worldScale * levelScale * diff.hpMult);
  const baseCoinReward = Math.round((8 + (meta.order - 1) * 7) * (1 + (levelNum - 1) * 0.024) * diff.coinMult);
  const trapSpeedScale = (1 + (meta.order - 1) * 0.16 + Math.min(0.45, levelNum * 0.0045)) * diff.trapSpeedMult;

  const poolIndexMax = Math.min(LOOT_WEAPON_IDS.length, 2 + meta.order + Math.floor(levelNum / 20));
  const dropPool = LOOT_WEAPON_IDS.slice(0, Math.max(3, poolIndexMax));

  let chestIslandSpec = null;
  let prevDirX = 0;

  for (let i = 1; i <= islandCount; i++) {
    const isFinal = i === islandCount;
    // Wide Battleground Islands (26x22 up to 30x26!) so 2x18 magma trenches, rotating blades & saws NEVER overlap!
    const w = isFinal ? (isBossLevel ? 30 : 28) : (26 + Math.floor(rng() * 3));
    const d = isFinal ? (isBossLevel ? 26 : 24) : (22 + Math.floor(rng() * 3));

    const dirRoll = rng();
    let dirX = 0;
    let dirZ = -1;
    if (prevDirX === 0 && i > 1 && i < islandCount) {
      if (dirRoll < 0.30) { dirX = -1; dirZ = 0; }
      else if (dirRoll > 0.70) { dirX = 1; dirZ = 0; }
    }
    prevDirX = dirX;

    const isSpiralExit = isSpiralLevel && i === 1;
    const useMover = !isSpiralExit && !isFinal && (i === 3 || rng() < 0.32);
    const useCrumble = !isSpiralExit && !useMover && (i === 2 || rng() < 0.42);
    const useJumpPad = !isSpiralExit && !useMover && !useCrumble && rng() < 0.44;
    // WIDE SKILL GAPS: Double-jump alone (~10.8m) CANNOT clear these — requires Double-Jump + Directional Dash (or Mover / Jump Pad)!
    const gap = isSpiralExit ? 6.2 : (useMover ? 20.5 : useCrumble ? 27.6 : useJumpPad ? 16.0 : 12.4);
    const rise = isSpiralExit ? 0.65 : (useJumpPad ? 3.2 : (1.35 + rng() * 0.55));

    const stepDist = (dirZ !== 0 ? (prevD / 2 + d / 2) : (prevW / 2 + w / 2)) + gap;
    const nx = cx + dirX * stepDist;
    const ny = cy + rise;
    const nz = cz + dirZ * stepDist;

    const midX = cx + dirX * ((dirZ !== 0 ? prevD / 2 : prevW / 2) + gap * 0.5);
    const midZ = cz + dirZ * ((dirZ !== 0 ? prevD / 2 : prevW / 2) + gap * 0.5);

    if (useMover) {
      const mStartX = cx + dirX * ((dirZ !== 0 ? prevD / 2 : prevW / 2) + 3.6);
      const mStartZ = cz + dirZ * ((dirZ !== 0 ? prevD / 2 : prevW / 2) + 3.6);
      const mEndX = nx - dirX * ((dirZ !== 0 ? d / 2 : w / 2) + 3.6);
      const mEndZ = nz - dirZ * ((dirZ !== 0 ? d / 2 : w / 2) + 3.6);
      movers.push({ x1: mStartX, y1: cy + 0.3, z1: mStartZ, x2: mEndX, y2: ny - 0.1, z2: mEndZ, w: 5.2, d: 5.2, speed: (0.85 + Math.min(0.45, levelNum * 0.005)) * trapSpeedScale });
    } else if (useCrumble) {
      // Single mid-chasm crumble stepping block leaving TWO 12.0m gaps (Double-Jump + Directional Dash each way!)
      crumbleBlocks.push({ x: midX, y: cy + rise * 0.5, z: midZ, w: 3.6, d: 3.6 });
    } else if (useJumpPad) {
      const padX = cx + dirX * ((dirZ !== 0 ? prevD / 2 : prevW / 2) - 2.1);
      const padZ = cz + dirZ * ((dirZ !== 0 ? prevD / 2 : prevW / 2) - 2.1);
      const padDef = [padX, cy, padZ, 21.0];
      jumpPads.push(padDef);
      islandSpecs[i - 1].outgoingJumpPad = { x: padX, z: padZ, dirX, dirZ };
    }

    const isCheckpoint = (i === 2) || (i === 4 && islandCount >= 5) || (isFinal && islandCount >= 5);
    const spec = {
      idx: i, x: nx, y: ny, z: nz, w, d,
      isFinal, isCheckpoint,
      incomingDirX: dirX, incomingDirZ: dirZ,
      outgoingJumpPad: null, chestJumpPad: null,
    };
    islandSpecs.push(spec);
    islands.push({
      x: nx, y: ny, z: nz, w, d,
      top: isFinal && isBossLevel ? 'gold' : style.top,
      sub: style.sub,
      rock: style.rock,
      checkpoint: isCheckpoint ? `${meta.short} CP${i}` : null,
    });

    if (i === Math.max(2, islandCount - 1)) {
      chestIslandSpec = spec;
    }

    cx = nx; cy = ny; cz = nz;
    prevW = w; prevD = d;
  }

  // Every 25th level (25, 50, 75, 100): HIDDEN CHEST on open unobstructed side (verified clear of all neighbor islands!)
  if (isChestLevel && chestIslandSpec) {
    let side = chestIslandSpec.incomingDirX === 1 ? 1 : (chestIslandSpec.incomingDirX === -1 ? -1 : (rng() < 0.5 ? -1 : 1));
    const sideBlocked = (s) => {
      const testX = chestIslandSpec.x + s * (chestIslandSpec.w * 0.5 + 6.0);
      const testZ = chestIslandSpec.z;
      return islandSpecs.some((sp) => sp !== chestIslandSpec && Math.abs(testX - sp.x) < (sp.w * 0.5 + 4.8) && Math.abs(testZ - sp.z) < (sp.d * 0.5 + 4.8));
    };
    if (sideBlocked(side) && !sideBlocked(-side)) side = -side;
    const chX = chestIslandSpec.x + side * (chestIslandSpec.w * 0.5 + 6.0);
    const chY = chestIslandSpec.y + 1.8;
    const chZ = chestIslandSpec.z;
    islands.push({ x: chX, y: chY, z: chZ, w: 7.0, d: 7.0, top: 'gold', sub: style.sub, rock: style.rock });
    const jpX = chestIslandSpec.x + side * (chestIslandSpec.w * 0.5 - 2.1);
    const jpZ = chestIslandSpec.z;
    jumpPads.push([jpX, chestIslandSpec.y, jpZ, 16.5]);
    chestIslandSpec.chestJumpPad = { x: jpX, z: jpZ, side };
    const rewardWeapon = RARE_BOSS_WEAPON_IDS[(meta.order + Math.floor(levelNum / 25)) % RARE_BOSS_WEAPON_IDS.length];
    chests.push({ id: `${worldId}-${levelNum}`, x: chX, y: chY, z: chZ, rewardWeapon, bonusCredits: 90 + meta.order * 35 });
  }

  // PASS 2: Populate Spawn Island (Island 0) with guaranteed ZERO-OVERLAP footprints!
  {
    const s0 = islandSpecs[0];
    const z0 = [];
    // Reserve hero spawn + spiral tower ring (if any) + outgoing jump pad (if any)
    if (isSpiralLevel) {
      reserveZone(z0, 0, 0, 9.2, 9.2);
      reserveZone(z0, 0, 10.0, 2.2, 2.0);
    } else {
      reserveZone(z0, 0, 4.5, 2.2, 2.2);
    }
    if (s0.outgoingJumpPad) reserveZone(z0, s0.outgoingJumpPad.x, s0.outgoingJumpPad.z, 2.0, 2.0);
    const off = isSpiralLevel ? 9.6 : 6.8;
    tryPlaceProp(z0, s0, { kind: style.prop, x: s0.x - off, y: s0.y, z: s0.z + (isSpiralLevel ? 9.4 : 6.2) });
    tryPlaceProp(z0, s0, { kind: style.prop, x: s0.x + off, y: s0.y, z: s0.z + (isSpiralLevel ? 9.4 : 6.2) });
    tryPlaceProp(z0, s0, { kind: style.scenery[0], x: s0.x - (isSpiralLevel ? 9.8 : 5.2), y: s0.y, z: s0.z - (isSpiralLevel ? 9.6 : 5.0) });
    tryPlaceProp(z0, s0, { kind: style.scenery[1 % style.scenery.length], x: s0.x + (isSpiralLevel ? 9.8 : 5.6), y: s0.y, z: s0.z - (isSpiralLevel ? 9.6 : 4.8) });
    tryPlaceProp(z0, s0, { kind: style.scenery[3 % style.scenery.length], x: s0.x - off, y: s0.y, z: s0.z + 0.5 });
    tryPlaceProp(z0, s0, { kind: style.scenery[2 % style.scenery.length], x: s0.x + off, y: s0.y, z: s0.z + 1.2 });
  }

  // PASS 3: Populate Battle Islands (1..islandCount) with strict Spatial Footprint Reservation (ZERO OVERLAP!)
  for (let i = 1; i <= islandCount; i++) {
    const spec = islandSpecs[i];
    const { x: nx, y: ny, z: nz, w, d, isFinal, isCheckpoint } = spec;
    const zones = [];

    // 0. Reserve mandatory gameplay zones FIRST: Outgoing Jump Pad, Chest Jump Pad, Entry Landing, Checkpoint & Goal Relic!
    if (spec.outgoingJumpPad) reserveZone(zones, spec.outgoingJumpPad.x, spec.outgoingJumpPad.z, 2.1, 2.1);
    if (spec.chestJumpPad) reserveZone(zones, spec.chestJumpPad.x, spec.chestJumpPad.z, 2.1, 2.1);
    if (spec.incomingDirZ !== 0) {
      reserveZone(zones, nx, nz - spec.incomingDirZ * (d * 0.5 - 2.0), 2.2, 2.0);
    } else if (spec.incomingDirX !== 0) {
      reserveZone(zones, nx - spec.incomingDirX * (w * 0.5 - 2.0), nz, 2.0, 2.2);
    }
    if (isCheckpoint) reserveZone(zones, nx, nz + d * 0.35, 1.95, 1.95);
    if (isFinal) reserveZone(zones, nx, nz - d * 0.40, 2.5, 2.5);

    // 1. Compact 2x18 Bubbling Magma Trench + Spiked Crusher Ram (automatically checks & avoids any Jump Pad / Relic!)
    if (i >= 1) {
      let laneLen = 18.0;
      let trenchZ = nz - d * 0.25;
      if (overlapsZones(zones, nx, trenchZ, laneLen * 0.5 + 0.35, 1.30, 0.35)) {
        // Shift slightly inward or shorten trench to guarantee crisp open clearance!
        trenchZ = nz - d * 0.20;
        if (overlapsZones(zones, nx, trenchZ, laneLen * 0.5 + 0.35, 1.30, 0.35)) {
          laneLen = 14.0;
        }
      }
      if (!overlapsZones(zones, nx, trenchZ, laneLen * 0.5 + 0.35, 1.30, 0.25)) {
        const span = laneLen * 0.5 - 1.6;
        crushers.push({
          x1: nx - span, y1: ny, z1: trenchZ,
          x2: nx + span, y2: ny, z2: trenchZ,
          w: 1.85, h: 1.95, d: 1.65,
          laneWidth: 2.0,
          laneLen,
          speed: (1.3 + Math.min(0.85, meta.order * 0.15 + levelNum * 0.007)) * diff.trapSpeedMult,
          phase: i * 0.9,
        });
        reserveZone(zones, nx, trenchZ, laneLen * 0.5 + 0.4, 1.35);
      }
    }

    // 2. Arch-Free Sliding Circular Rotating Sawblades (Left <-> Right on flush floor track, strictly clear of Checkpoint & Jump Pads!)
    if (i === 1 || i % 2 === 0 || isFinal) {
      const sawCandidates = [nz + d * 0.23, nz + d * 0.18];
      for (const sawZ of sawCandidates) {
        if (!overlapsZones(zones, nx, sawZ, 4.75, 0.95, 0.35)) {
          pendulums.push({
            x: nx, y: ny, z: sawZ,
            speed: (1.85 + Math.min(0.75, meta.order * 0.14 + levelNum * 0.006)) * diff.trapSpeedMult,
            phase: i * 1.3,
          });
          reserveZone(zones, nx, sawZ, 4.75, 0.95);
          break;
        }
      }
    }

    // 3. Riveted Metal Box + Rotating Blade Sweepers (reserves FULL sweep radius so blades NEVER clip traps or props!)
    const mainSpinnerR = isFinal ? 3.4 : 3.0;
    const mainReserveR = mainSpinnerR + 0.15;
    if (!overlapsZones(zones, nx, nz + 0.6, mainReserveR, mainReserveR, 0.30)) {
      spinners.push({
        x: nx, y: ny, z: nz + 0.6,
        radius: mainSpinnerR,
        speed: (1.55 + Math.min(0.9, meta.order * 0.18 + levelNum * 0.008)) * diff.trapSpeedMult * (i % 2 === 0 ? -1 : 1),
        phase: rng() * Math.PI * 2,
      });
      reserveZone(zones, nx, nz + 0.6, mainReserveR, mainReserveR);
    }
    if (i >= 3 || isFinal) {
      const sp2X = nx + (i % 2 === 0 ? 7.6 : -7.6);
      const sp2Z = nz + 1.5;
      if (!overlapsZones(zones, sp2X, sp2Z, 2.65, 2.65, 0.30)) {
        spinners.push({
          x: sp2X, y: ny, z: sp2Z,
          radius: 2.5,
          speed: (1.85 + Math.min(0.7, levelNum * 0.006)) * diff.trapSpeedMult * (i % 2 === 0 ? 1 : -1),
          phase: rng() * Math.PI * 2,
        });
        reserveZone(zones, sp2X, sp2Z, 2.65, 2.65);
      }
    }

    // 4. Integrated Flame-Shooting Stone Brick Battlement Wall (aligned strictly with wallZ = nz - 1.2, flips side if Jump Pad occupies edge!)
    const hasFlameWall = i >= 2 || isFinal;
    let tSide = i % 2 === 0 ? -1 : 1;
    const wallZ = nz - 1.2;
    let placedTurretSide = 0;
    if (hasFlameWall) {
      for (const trySide of [tSide, -tSide]) {
        const tx = nx + trySide * (w * 0.43);
        if (!overlapsZones(zones, tx, wallZ, 1.1, 2.4, 0.30)) {
          turrets.push({
            x: tx, y: ny, z: wallZ,
            dirX: -trySide, dirZ: 0,
            interval: Math.max(1.7, 2.8 / trapSpeedScale),
            speed: 10.5 + meta.order * 1.1,
            range: w * 0.88,
            phase: i * 0.7,
            color: 0xf97316,
          });
          reserveZone(zones, tx, wallZ, 1.25, 2.5);
          // Reserve clean muzzle firing lane directly in front of port
          reserveZone(zones, tx - trySide * 2.1, wallZ, 1.2, 1.1);
          placedTurretSide = trySide;
          break;
        }
      }
    }

    // 5. Pop-Up Spike Traps (each verified strictly non-overlapping!)
    const spikeCandidates = [
      { x: nx - 6.6, z: nz - 1.6, phase: i * 0.9 },
      { x: nx + 6.6, z: nz - 1.6, phase: i * 0.9 + 1.2 },
      { x: nx + (i % 2 === 0 ? -7.8 : 7.8), z: nz + d * 0.25, phase: i * 0.9 + 2.2 },
    ];
    for (const sc of spikeCandidates) {
      if (!overlapsZones(zones, sc.x, sc.z, 1.35, 1.35, 0.35)) {
        spikeTraps.push({
          x: sc.x, y: ny, z: sc.z, w: 2.4, d: 2.4,
          period: Math.max(1.8, 3.1 / trapSpeedScale), phase: sc.phase,
        });
        reserveZone(zones, sc.x, sc.z, 1.35, 1.35);
      }
    }

    // 6. Biome Floor Hazard Zones (Flaming Grass — strictly checked against Jump Pads, Trench & Spikes!)
    const hzSide = i % 2 === 0 ? -1 : 1;
    const hzCandidates = [
      { x: nx + hzSide * (w * 0.35), z: nz - 1.6, w: 3.4, d: 2.6 },
    ];
    if (i >= 2 || meta.order >= 2) {
      hzCandidates.push({ x: nx - hzSide * (w * 0.35), z: nz + 4.8, w: 3.2, d: 2.4 });
    }
    for (const hc of hzCandidates) {
      if (!overlapsZones(zones, hc.x, hc.z, hc.w * 0.5 + 0.25, hc.d * 0.5 + 0.25, 0.35)) {
        hazardZones.push({
          x: hc.x, y: ny, z: hc.z,
          w: hc.w, d: hc.d,
          color: style.hazardColor, emissive: style.hazardEmissive,
        });
        reserveZone(zones, hc.x, hc.z, hc.w * 0.5 + 0.25, hc.d * 0.5 + 0.25);
      }
    }

    // 7. Gleaming 1UP Heart Stones on key battle islands (strictly clear of all traps!)
    if (i === 2 || i === 4 || isFinal) {
      const hsSide = i % 2 === 0 ? -1 : 1;
      for (const tryS of [hsSide, -hsSide]) {
        const hx = nx + tryS * (w * 0.24);
        const hz = nz + d * 0.26;
        if (!overlapsZones(zones, hx, hz, 1.0, 1.0, 0.35)) {
          heartStones.push({ x: hx, y: ny, z: hz });
          reserveZone(zones, hx, hz, 1.0, 1.0);
          break;
        }
      }
    }

    // 8. LUSH BIOME SCENERY, LANDMARK BUILDINGS, BRICK WALLS, BRAZIERS & CAMPFIRES (ALL via tryPlaceProp = ZERO OVERLAP!)
    if (i === 1) {
      tryPlaceProp(zones, spec, { kind: 'campfire', x: nx - w * 0.34, y: ny, z: nz + d * 0.32 });
    }
    const hasLandmark = i === Math.ceil(islandCount / 2) || isFinal;
    const landmarkSide = i % 2 === 0 ? -1 : 1;
    if (hasLandmark) {
      tryPlaceProp(zones, spec, { kind: 'worldLandmark', x: nx + landmarkSide * (w * 0.34), y: ny, z: nz - d * 0.32 });
    }
    if (placedTurretSide !== -1) {
      tryPlaceProp(zones, spec, { kind: 'stoneWall', x: nx - w * 0.43, y: ny, z: wallZ, rot: Math.PI / 2 });
    }
    if (placedTurretSide !== 1) {
      tryPlaceProp(zones, spec, { kind: 'stoneWall', x: nx + w * 0.43, y: ny, z: wallZ, rot: -Math.PI / 2 });
    }
    tryPlaceProp(zones, spec, { kind: 'brazier',  x: nx - w * 0.35, y: ny, z: nz - d * 0.35 });
    tryPlaceProp(zones, spec, { kind: style.prop, x: nx - w * 0.42, y: ny, z: nz - d * 0.39 });
    tryPlaceProp(zones, spec, { kind: style.prop, x: nx + w * 0.42, y: ny, z: nz - d * 0.39 });
    tryPlaceProp(zones, spec, { kind: 'brazier',  x: nx + w * 0.35, y: ny, z: nz + d * 0.35 });
    tryPlaceProp(zones, spec, { kind: style.prop, x: nx + w * 0.42, y: ny, z: nz + d * 0.39 });
    tryPlaceProp(zones, spec, { kind: style.prop, x: nx - w * 0.42, y: ny, z: nz + d * 0.39 });

    // Rich perimeter & pocket nature props (grass tufts, corals, fallen logs, tree stumps, stone clusters, crystals)
    const propCount = 10;
    for (let pIdx = 0; pIdx < propCount; pIdx++) {
      const ang = (pIdx / propCount) * Math.PI * 2 + rng() * 0.4;
      const rx = (0.31 + rng() * 0.12) * w;
      const rz = (0.30 + rng() * 0.12) * d;
      const px = nx + Math.cos(ang) * rx;
      const pz = nz + Math.sin(ang) * rz;
      const kind = style.scenery[Math.floor(rng() * style.scenery.length)];
      tryPlaceProp(zones, spec, { kind, x: px, y: ny, z: pz, rot: rng() * Math.PI * 2 });
    }

    // Multiple NPCs spread generously across the extra-wide island (spawning clear of magma trench & solid props!)
    const countHere = isFinal
      ? (isBossLevel ? 5 : 4 + Math.min(2, Math.floor(levelNum / 30)))
      : (3 + Math.min(2, Math.floor((levelNum + 10) / 30)));

    for (let eIdx = 0; eIdx < countHere; eIdx++) {
      const isBoss = isFinal && isBossLevel && eIdx === 0;
      let ex = nx;
      let ez = isBoss ? nz + 0.2 : nz;
      const halfReq = isBoss ? 1.05 : 0.75;
      if (!isBoss || overlapsZones(zones, ex, ez, halfReq, halfReq, 0.25)) {
        let placed = false;
        const triesMax = isBoss ? 16 : 12;
        for (let tries = 0; tries < triesMax; tries++) {
          const angle = (eIdx / countHere) * Math.PI * 2 + (tries / triesMax) * Math.PI * 2 + rng() * 0.35;
          const radX = isBoss ? Math.min(w * 0.28, 3.8 + (tries % 3) * 1.1) : Math.min(w * 0.34, 4.2 + rng() * 3.8);
          const radZ = isBoss ? Math.min(d * 0.25, 3.2 + (tries % 3) * 0.9) : Math.min(d * 0.28, 3.2 + rng() * 2.8);
          const candX = nx + Math.cos(angle) * radX;
          const candZ = nz + Math.sin(angle) * radZ;
          if (!overlapsZones(zones, candX, candZ, halfReq, halfReq, 0.25)) {
            ex = candX; ez = candZ; placed = true; break;
          }
        }
        if (!placed && isBoss) {
          ex = nx;
          ez = nz + d * 0.14;
        }
      }

      const isRanged = isBoss ? (levelNum % 20 === 0) : (rng() < 0.45);
      const dropWeapon = isBoss
        ? RARE_BOSS_WEAPON_IDS[(meta.order + Math.floor(levelNum / 10)) % RARE_BOSS_WEAPON_IDS.length]
        : dropPool[Math.floor(rng() * dropPool.length)];
      // Epic Warden Bosses are MUCH harder to kill (7.5x base HP + boss difficulty multiplier + armored rage phases!)
      const hpMult = isBoss ? (7.5 * (diff.bossHpMult / diff.hpMult)) : (0.95 + rng() * 0.35);

      enemies.push({
        x: ex, y: ny, z: ez,
        type: isRanged ? 'archer' : 'brawler',
        isBoss,
        displayName: isBoss ? `${meta.short} WARDEN BOSS` : '',
        maxHp: Math.round(baseEnemyHp * hpMult),
        coins: isBoss ? baseCoinReward * 6 : baseCoinReward,
        bodyColor: style.enemyColors[eIdx % style.enemyColors.length],
        accentColor: isBoss ? 0xfacc15 : 0xe2e8f0,
        patrolR: Math.min(w, d) * 0.38,
        dropWeapon,
        speed: (isBoss ? 4.4 : 2.7 + Math.min(1.6, meta.order * 0.3 + levelNum * 0.012)) * diff.speedMult,
        fireRate: Math.max(0.55, (isBoss ? 1.15 : 1.8 - meta.order * 0.14 - levelNum * 0.004) * diff.fireRateMult),
        diffTier: diff.tier,
      });
    }
  }

  const lastSpec = islandSpecs[islandSpecs.length - 1];
  const relic = { x: lastSpec.x, y: lastSpec.y + 1.7, z: lastSpec.z - lastSpec.d * 0.40, title: `${uniqueTitle} (Lv.${levelNum})`, sealed: true };

  return {
    worldId, levelNum, isHaven: false, isBossLevel, isChestLevel, isSpiralLevel,
    name: `${meta.name} ${levelNum} · ${uniqueTitle}${isSpiralLevel ? ' · Spiral Tower' : ''}`,
    sky: mood ? mood.sky : meta.sky,
    fog: mood ? mood.fog : meta.fog,
    dustColor: style.dustColor,
    spawn: isSpiralLevel ? [0, 1.2, 10.0] : [0, 1.2, 4.5],
    islands, props, pillars, jumpPads, movers,
    spikeTraps, spinners, crumbleBlocks, crushers, hazardZones, pendulums, turrets,
    portals: [], npcs: [],
    heartStones,
    enemies, chests, relic,
  };
}
