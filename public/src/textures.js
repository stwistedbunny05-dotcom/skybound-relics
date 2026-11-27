// Skybound Relics — Master 32x32 HD Pixel-Art Tileset & Character Texture Generator
// Inspired by Minecraft Faithful 32x & Stylized Roblox Fantasy RPGs (Crisp Bevels, Rich Palettes, Zero Bland Flats!)
import * as THREE from '../lib/three.module.min.js';

function makePixelTexture(size, drawFn) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  drawFn(ctx, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.userData = { shared: true };
  return tex;
}

function hash(x, y, seed = 1) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

function fillNoise(ctx, size, palette, seed) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      ctx.fillStyle = palette[Math.floor(hash(x, y, seed) * palette.length)];
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

// Helper: draws beveled staggered bricks with top highlight, bottom shadow & mortar crevices!
function drawBevelBricks(ctx, size, rows, cols, palette, mortar, highlight, shadow, seed) {
  ctx.fillStyle = mortar;
  ctx.fillRect(0, 0, size, size);
  const bh = Math.floor(size / rows);
  const bw = Math.floor(size / cols);
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2 === 1) ? Math.floor(bw / 2) : 0;
    for (let c = -1; c <= cols; c++) {
      const bx = c * bw + offset;
      const by = r * bh;
      const col = palette[Math.floor(hash(c + 10, r + 5, seed) * palette.length)];
      ctx.fillStyle = col;
      ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
      // Subtle pixel-art grain inside each brick
      for (let py = 2; py < bh - 2; py++) {
        for (let px = 2; px < bw - 2; px++) {
          const h = hash(bx + px, by + py, seed + 17);
          if (h > 0.82) {
            ctx.fillStyle = highlight;
            ctx.fillRect(bx + px, by + py, 1, 1);
          } else if (h < 0.14) {
            ctx.fillStyle = shadow;
            ctx.fillRect(bx + px, by + py, 1, 1);
          }
        }
      }
      // Crisp sunlit top/left bevel & shadowed bottom/right edge
      ctx.fillStyle = highlight;
      ctx.fillRect(bx + 1, by + 1, bw - 2, 1);
      ctx.fillRect(bx + 1, by + 1, 1, bh - 2);
      ctx.fillStyle = shadow;
      ctx.fillRect(bx + 1, by + bh - 2, bw - 2, 1);
      ctx.fillRect(bx + bw - 2, by + 1, 1, bh - 2);
    }
  }
}

// =========================================================================
// CHARACTER PIXEL-ART TEXTURE GENERATOR (Player, NPCs, Roaming AI, Enemies!)
// =========================================================================
function shadeHex(hexStr, factor) {
  const c = new THREE.Color(hexStr);
  c.multiplyScalar(factor);
  return '#' + c.getHexString();
}
function tintHex(hexStr, targetHex, amt) {
  const c = new THREE.Color(hexStr);
  c.lerp(new THREE.Color(targetHex), amt);
  return '#' + c.getHexString();
}

const _charTexCache = new Map();
export function makeCharacterTextures(tunicHex = '#2563eb', capeHex = '#e11d48', bootHex = '#4a3222') {
  const key = `${tunicHex}_${capeHex}_${bootHex}`;
  if (_charTexCache.has(key)) return _charTexCache.get(key);

  const tLight = tintHex(tunicHex, '#ffffff', 0.25);
  const tDark = shadeHex(tunicHex, 0.62);
  const tDeep = shadeHex(tunicHex, 0.42);
  const cLight = tintHex(capeHex, '#ffffff', 0.22);
  const cDark = shadeHex(capeHex, 0.58);
  const bLight = tintHex(bootHex, '#ffffff', 0.22);
  const bDark = shadeHex(bootHex, 0.55);

  const tunicTex = makePixelTexture(32, (ctx) => {
    fillNoise(ctx, 32, [tunicHex, tLight, tunicHex, tDark], 301);
    // Crisp collar + V-neck tunic lapel + shoulder seams
    ctx.fillStyle = tDark;
    ctx.fillRect(0, 0, 32, 3);
    ctx.fillRect(0, 0, 2, 32); ctx.fillRect(30, 0, 2, 32);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(10, 0, 12, 3); ctx.fillRect(12, 3, 8, 2); ctx.fillRect(14, 5, 4, 2);
    // Gold-trimmed chest tabard stripe & royal crest
    ctx.fillStyle = '#facc15';
    ctx.fillRect(15, 7, 2, 16);
    ctx.fillRect(12, 10, 8, 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(14, 10, 4, 2);
    // Stitched leather adventurer belt + gold buckle!
    ctx.fillStyle = '#3b2214';
    ctx.fillRect(0, 22, 32, 5);
    ctx.fillStyle = '#5c3620';
    ctx.fillRect(0, 23, 32, 2);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(12, 21, 8, 7);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(13, 22, 6, 1);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(14, 23, 4, 3);
    // Lower tunic hem shadow
    ctx.fillStyle = tDeep;
    ctx.fillRect(0, 29, 32, 3);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 28, 32, 1);
  });

  const sleeveTex = makePixelTexture(16, (ctx) => {
    fillNoise(ctx, 16, [tunicHex, tLight, tunicHex, tDark], 302);
    // Shoulder bevel + leather wrist bracer with gold trim
    ctx.fillStyle = tLight; ctx.fillRect(0, 0, 16, 2);
    ctx.fillStyle = '#4a2c18'; ctx.fillRect(0, 11, 16, 5);
    ctx.fillStyle = '#facc15'; ctx.fillRect(0, 11, 16, 1);
    ctx.fillStyle = '#29170c'; ctx.fillRect(0, 15, 16, 1);
  });

  const bootTex = makePixelTexture(16, (ctx) => {
    // Upper trouser + knee pad + cuffed leather adventurer boot + dark sole
    fillNoise(ctx, 16, [tDark, tDeep, tDark, '#1e293b'], 303);
    ctx.fillStyle = bLight; ctx.fillRect(0, 6, 16, 2); // boot cuff
    fillNoise(ctx, 16, [bootHex, bLight, bootHex, bDark], 304);
    ctx.fillStyle = tDark; ctx.fillRect(0, 0, 16, 6);
    ctx.fillStyle = '#facc15'; ctx.fillRect(6, 7, 4, 2); // boot buckle
    ctx.fillStyle = bLight; ctx.fillRect(2, 10, 12, 1);
    ctx.fillStyle = '#140c08'; ctx.fillRect(0, 13, 16, 3); // sturdy sole
  });

  const capeTex = makePixelTexture(16, (ctx) => {
    fillNoise(ctx, 16, [capeHex, cLight, capeHex, cDark], 305);
    // Woven vertical folds + gold royal hem & diamond crest
    ctx.fillStyle = cDark;
    ctx.fillRect(3, 0, 1, 16); ctx.fillRect(12, 0, 1, 16);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 13, 16, 2);
    ctx.fillRect(6, 5, 4, 4);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(7, 6, 2, 2);
  });

  const pack = { tunicTex, sleeveTex, bootTex, capeTex };
  _charTexCache.set(key, pack);
  return pack;
}

export function createVoxelMaterials() {
  // =========================================================================
  // 1. VIBRANT 32x32 TERRAIN & BIOME TILES (Minecraft Faithful / Roblox Style)
  // =========================================================================
  const grassTop = makePixelTexture(32, (ctx) => {
    fillNoise(ctx, 32, ['#2eb843', '#3ccf4e', '#249c38', '#52de5c', '#1e8530'], 1);
    // Crisp layered grass blade tufts
    for (let i = 0; i < 42; i++) {
      const gx = Math.floor(hash(i, 1, 10) * 30);
      const gy = Math.floor(hash(i, 2, 10) * 30);
      ctx.fillStyle = i % 3 === 0 ? '#86efac' : '#166534';
      ctx.fillRect(gx, gy, 1, 2);
      if (i % 4 === 0) ctx.fillRect(gx + 1, gy + 1, 1, 1);
    }
    // Vibrant wildflowers (golden buttercups, white daisies, sky bluebells)
    ctx.fillStyle = '#fde047'; ctx.fillRect(5, 7, 2, 2); ctx.fillRect(23, 21, 2, 2);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(19, 6, 2, 2); ctx.fillRect(8, 25, 2, 1);
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(14, 17, 2, 2);
  });

  const dirt = makePixelTexture(32, (ctx) => {
    fillNoise(ctx, 32, ['#7c4d2b', '#693f22', '#8f5b34', '#59331a'], 2);
    // Warm earth pebbles & roots
    for (let i = 0; i < 24; i++) {
      const px = Math.floor(hash(i, 3, 22) * 29);
      const py = Math.floor(hash(i, 4, 22) * 29);
      ctx.fillStyle = i % 3 === 0 ? '#9ca3af' : '#432512';
      ctx.fillRect(px, py, 2, 2);
      if (i % 3 === 0) { ctx.fillStyle = '#cbd5e1'; ctx.fillRect(px, py, 1, 1); }
    }
  });

  const grassSide = makePixelTexture(32, (ctx) => {
    const dirtPal = ['#7c4d2b', '#693f22', '#8f5b34', '#59331a'];
    const grassPal = ['#2eb843', '#3ccf4e', '#249c38', '#52de5c'];
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const over = 7 + Math.floor(hash(Math.floor(x / 2), 0, 3) * 6);
        if (y < over) {
          ctx.fillStyle = y < 2 ? '#6ee787' : grassPal[Math.floor(hash(x, y, 4) * 4)];
        } else if (y === over || y === over + 1) {
          ctx.fillStyle = '#14532d'; // rich overhang shadow!
        } else {
          ctx.fillStyle = dirtPal[Math.floor(hash(x, y, 2) * 4)];
        }
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Pebbles in dirt
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(5, 19, 2, 2); ctx.fillRect(21, 24, 3, 2); ctx.fillRect(13, 27, 2, 2);
  });

  const wood = makePixelTexture(32, (ctx) => {
    const pal = ['#784621', '#633819', '#8c542a', '#4d2b12'];
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const ridge = (x % 6 === 0) ? '#3e210d' : (x % 6 === 1 ? '#9e6234' : pal[Math.floor(hash(x, Math.floor(y / 4), 13) * 4)]);
        ctx.fillStyle = ridge;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });

  const leaves = makePixelTexture(32, (ctx) => {
    fillNoise(ctx, 32, ['#1e8f35', '#2bb343', '#156e28', '#4ade60', '#115720'], 15);
    // Sunlit leaf clusters + deep canopy pockets
    for (let i = 0; i < 28; i++) {
      const lx = Math.floor(hash(i, 7, 15) * 28);
      const ly = Math.floor(hash(i, 9, 15) * 28);
      ctx.fillStyle = i % 2 === 0 ? '#6ee787' : '#0f4c1c';
      ctx.fillRect(lx, ly, 3, 2);
    }
  });

  // --- SKY BEACH (32x32 Sun-Warmed Sand, Ripples, Shells, Palm & Dock Planks) ---
  const sand = makePixelTexture(32, (ctx) => {
    fillNoise(ctx, 32, ['#f6d479', '#ecc060', '#fce299', '#dfb04e'], 21);
    // Wind-carved sand ripples
    ctx.fillStyle = '#fff3c4';
    for (let y = 4; y < 32; y += 8) {
      for (let x = 0; x < 32; x++) {
        const dy = Math.round(Math.sin(x * 0.4) * 1);
        ctx.fillRect(x, (y + dy + 32) % 32, 1, 1);
      }
    }
    ctx.fillStyle = '#c89438';
    for (let y = 5; y < 32; y += 8) {
      for (let x = 0; x < 32; x++) {
        const dy = Math.round(Math.sin(x * 0.4) * 1);
        ctx.fillRect(x, (y + dy + 32) % 32, 1, 1);
      }
    }
    // Tiny pink & white seashells
    ctx.fillStyle = '#fda4af'; ctx.fillRect(7, 13, 2, 2);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(24, 25, 2, 2);
  });

  const palmWood = makePixelTexture(32, (ctx) => {
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        ctx.fillStyle = (y % 6 === 0) ? '#593a22' : (y % 6 === 1 ? '#b58759' : ((x + y) % 4 === 0 ? '#9c7146' : '#855c37'));
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });

  const palmLeaves = makePixelTexture(32, (ctx) => {
    fillNoise(ctx, 32, ['#1ea84c', '#34cc63', '#14823a', '#6ee787'], 23);
    ctx.fillStyle = '#a7f3d0';
    for (let i = 0; i < 32; i += 4) ctx.fillRect(i, 15, 2, 2);
  });

  const dockPlanks = makePixelTexture(32, (ctx) => {
    fillNoise(ctx, 32, ['#ba8550', '#a36f3e', '#cc9862', '#8f5e31'], 24);
    for (let y = 0; y < 32; y += 8) {
      ctx.fillStyle = '#4a2e16'; ctx.fillRect(0, y, 32, 1);
      ctx.fillStyle = '#dfb07d'; ctx.fillRect(0, y + 1, 32, 1);
      // Plank vertical joint + iron nails
      const jx = (y % 16 === 0) ? 14 : 26;
      ctx.fillStyle = '#4a2e16'; ctx.fillRect(jx, y, 1, 8);
      ctx.fillStyle = '#334155';
      ctx.fillRect(jx - 2, y + 2, 1, 1); ctx.fillRect(jx - 2, y + 5, 1, 1);
      ctx.fillRect((jx + 2) % 32, y + 2, 1, 1); ctx.fillRect((jx + 2) % 32, y + 5, 1, 1);
    }
  });

  // --- SKY DESERT (32x32 Carved Sandstone Blocks, Terracotta Red Rock & Cactus) ---
  const sandstone = makePixelTexture(32, (ctx) => {
    drawBevelBricks(ctx, 32, 4, 2, ['#eb9f44', '#df8e32', '#f5b35d', '#cc7c26'], '#7c4314', '#fde099', '#a65c1b', 31);
    // Subtle lapis-blue hieroglyph band
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(2, 14, 12, 2); ctx.fillRect(18, 14, 12, 2);
  });

  const redRock = makePixelTexture(32, (ctx) => {
    fillNoise(ctx, 32, ['#b84a28', '#9e3a1d', '#d15e38', '#802b14'], 32);
    for (let y = 4; y < 32; y += 7) {
      ctx.fillStyle = '#e07a52'; ctx.fillRect(0, y, 32, 1);
      ctx.fillStyle = '#6b200d'; ctx.fillRect(0, y + 1, 32, 1);
    }
  });

  const cactus = makePixelTexture(32, (ctx) => {
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        ctx.fillStyle = (x % 6 === 0) ? '#14532d' : (x % 6 === 1 ? '#4ade80' : ((x + y) % 9 === 0 ? '#fef08a' : '#228b3b'));
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });

  // --- SKY DUNGEON (32x32 Gothic Obsidian Masonry & Glowing Soul-Rune Stone) ---
  const obsidian = makePixelTexture(32, (ctx) => {
    drawBevelBricks(ctx, 32, 4, 2, ['#2c2547', '#221c38', '#382f59', '#19142b'], '#0b0814', '#52467d', '#120d21', 41);
  });

  const runeStone = makePixelTexture(32, (ctx) => {
    drawBevelBricks(ctx, 32, 2, 2, ['#362d57', '#2a2245', '#423769'], '#120d21', '#5c4e8a', '#1b1530', 42);
    // Glowing violet-cyan ancient sigil frame
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(5, 5, 22, 2); ctx.fillRect(5, 25, 22, 2);
    ctx.fillRect(5, 5, 2, 22); ctx.fillRect(25, 5, 2, 22);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(13, 13, 6, 6);
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(15, 15, 2, 2);
  });

  // --- SHARED ARCHITECTURE (32x32 Crisp Beveled Stone, Mossy Stone, Ruin Brick, Gold) ---
  const stone = makePixelTexture(32, (ctx) => {
    drawBevelBricks(ctx, 32, 4, 2, ['#7c8899', '#6c7787', '#8d99ab', '#5d6775'], '#333b45', '#b0bccd', '#47505c', 5);
  });

  const mossyStone = makePixelTexture(32, (ctx) => {
    drawBevelBricks(ctx, 32, 4, 2, ['#748091', '#647080', '#8490a1'], '#2f3742', '#a5b2c4', '#444e5c', 7);
    const moss = ['#2eb843', '#4ade60', '#1e8530'];
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const m = hash(x, y, 8);
        if ((y < 8 && m > 0.35) || (m > 0.78)) {
          ctx.fillStyle = moss[Math.floor(hash(x, y, 9) * 3)];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  const ruinBrick = makePixelTexture(32, (ctx) => {
    drawBevelBricks(ctx, 32, 4, 2, ['#d4c39e', '#c2b08a', '#e3d4b2', '#b09d78'], '#6e5e41', '#f7ecd0', '#8c7a59', 9);
    // Glowing sky-relic runes inlaid into ancient stonework
    ctx.fillStyle = '#0ea5e9'; ctx.fillRect(6, 6, 4, 4); ctx.fillRect(22, 22, 4, 4);
    ctx.fillStyle = '#bae6fd'; ctx.fillRect(7, 7, 2, 2); ctx.fillRect(23, 23, 2, 2);
  });

  const goldStone = makePixelTexture(32, (ctx) => {
    fillNoise(ctx, 32, ['#eab308', '#facc15', '#ca8a04', '#fde047'], 11);
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(0, 0, 32, 2); ctx.fillRect(0, 30, 32, 2); ctx.fillRect(0, 0, 2, 32); ctx.fillRect(30, 0, 2, 32);
    ctx.fillStyle = '#fef9c3';
    ctx.fillRect(3, 3, 26, 2); ctx.fillRect(3, 3, 2, 26);
    ctx.fillStyle = '#a16207';
    ctx.fillRect(3, 27, 26, 2); ctx.fillRect(27, 3, 2, 26);
    // Diagonal sheen
    ctx.fillStyle = '#ffffff';
    for (let i = 6; i < 16; i++) ctx.fillRect(i, 22 - i, 2, 1);
  });

  const chestTex = makePixelTexture(32, (ctx) => {
    fillNoise(ctx, 32, ['#8f5020', '#784118', '#a35e29', '#613311'], 55);
    for (let y = 6; y < 28; y += 6) { ctx.fillStyle = '#47220a'; ctx.fillRect(0, y, 32, 1); }
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, 32, 3); ctx.fillRect(0, 29, 32, 3);
    ctx.fillRect(0, 0, 3, 32); ctx.fillRect(29, 0, 3, 32);
    ctx.fillRect(11, 10, 10, 10);
    ctx.fillStyle = '#fef08a'; ctx.fillRect(12, 11, 8, 2);
    ctx.fillStyle = '#0f172a'; ctx.fillRect(14, 14, 4, 4);
  });

  const water = makePixelTexture(32, (ctx) => {
    const pal = ['#0284c7', '#06b6d4', '#0369a1', '#22d3ee'];
    fillNoise(ctx, 32, pal, 17);
    ctx.fillStyle = '#a5f3fc';
    for (let y = 3; y < 32; y += 8) {
      for (let x = 0; x < 32; x += 6) {
        ctx.fillRect((x + y) % 32, y, 3, 1);
        ctx.fillRect((x + y + 1) % 32, (y + 1) % 32, 2, 1);
      }
    }
  });

  const jumpPad = makePixelTexture(32, (ctx) => {
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#06b6d4'; ctx.fillRect(2, 2, 28, 28);
    ctx.fillStyle = '#1e293b'; ctx.fillRect(5, 5, 22, 22);
    ctx.fillStyle = '#67e8f9';
    ctx.fillRect(14, 8, 4, 3); ctx.fillRect(10, 11, 12, 3); ctx.fillRect(8, 14, 16, 4);
    ctx.fillStyle = '#fde047'; ctx.fillRect(12, 20, 8, 4);
  });

  // --- CLOUD SAFE HAVEN & SKY MARBLE (32x32 Vibrant Sculpted Cloud & Ornate Royal Marble!) ---
  const cloudTop = makePixelTexture(32, (ctx) => {
    fillNoise(ctx, 32, ['#ffffff', '#eef6ff', '#e0f0ff', '#f8fbff'], 61);
    ctx.fillStyle = '#bfdbfe';
    ctx.fillRect(3, 5, 7, 4); ctx.fillRect(18, 19, 9, 4); ctx.fillRect(8, 24, 6, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, 2, 10, 4); ctx.fillRect(16, 10, 11, 4); ctx.fillRect(6, 18, 8, 3);
  });

  const cloudSide = makePixelTexture(32, (ctx) => {
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const puff = 9 + Math.floor(hash(Math.floor(x / 3), 0, 62) * 7);
        ctx.fillStyle = y < puff
          ? (hash(x, y, 63) > 0.45 ? '#ffffff' : '#eff6ff')
          : (y < 23 ? (hash(x, y, 64) > 0.5 ? '#cfe6ff' : '#badbff') : '#93c5fd');
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });

  const cloudBottom = makePixelTexture(32, (ctx) => fillNoise(ctx, 32, ['#93c5fd', '#7db6fa', '#add3ff', '#6aa5f2'], 65));

  const skyMarble = makePixelTexture(32, (ctx) => {
    fillNoise(ctx, 32, ['#f8fafc', '#eef3fa', '#ffffff', '#e4ecf7'], 66);
    // Subtle blue-marble diagonal veins
    ctx.fillStyle = '#cbd5e1';
    for (let i = 0; i < 32; i++) {
      ctx.fillRect(i, (i + 5) % 32, 1, 1);
      ctx.fillRect((i * 2) % 32, (31 - i) % 32, 1, 1);
    }
    // Crisp dark grout + ornate gold filigree + glowing sky-sapphire centerpiece!
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, 32, 1); ctx.fillRect(0, 31, 32, 1);
    ctx.fillRect(0, 0, 1, 32); ctx.fillRect(31, 0, 1, 32);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(3, 3, 26, 2); ctx.fillRect(3, 27, 26, 2);
    ctx.fillRect(3, 3, 2, 26); ctx.fillRect(27, 3, 2, 26);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(3, 3, 26, 1); ctx.fillRect(3, 3, 1, 26);
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(13, 13, 6, 6);
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(14, 14, 3, 3);
  });

  const mossyLog = makePixelTexture(32, (ctx) => {
    const bark = ['#6b3e1f', '#573117', '#7d4b28', '#452510'];
    const moss = ['#2eb843', '#4ade60', '#1e8530'];
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const m = hash(x, y, 71);
        ctx.fillStyle = (y < 10 && m > 0.42) ? moss[Math.floor(hash(x, y, 72) * 3)] : bark[Math.floor(hash(Math.floor(x / 3), y, 73) * 4)];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });

  const coralPinkTex = makePixelTexture(32, (ctx) => fillNoise(ctx, 32, ['#fb7185', '#f43f5e', '#fda4af', '#e11d48'], 81));
  const coralTealTex = makePixelTexture(32, (ctx) => fillNoise(ctx, 32, ['#2dd4bf', '#14b8a6', '#5eead4', '#0d9488'], 82));
  const coralOrangeTex = makePixelTexture(32, (ctx) => fillNoise(ctx, 32, ['#fb923c', '#f97316', '#fdba74', '#ea580c'], 83));

  // =========================================================================
  // 2. NEW 32x32 ARCHITECTURAL TEXTURES FOR MEGA-CASTLE, FORGE, STORE & PORTALS!
  // =========================================================================
  const castleStone = makePixelTexture(32, (ctx) => {
    drawBevelBricks(ctx, 32, 4, 2, ['#e8edf5', '#dce4f0', '#f4f7fc', '#cdd8e8'], '#64748b', '#ffffff', '#94a3b8', 91);
  });
  const castleDark = makePixelTexture(32, (ctx) => {
    drawBevelBricks(ctx, 32, 4, 2, ['#586578', '#4a5568', '#68778c', '#3d4757'], '#1e293b', '#8ea0b8', '#2a3342', 92);
  });
  const castleRoof = makePixelTexture(32, (ctx) => {
    // Scalloped royal cobalt-blue castle roof shingles!
    ctx.fillStyle = '#0f2557'; ctx.fillRect(0, 0, 32, 32);
    for (let r = 0; r < 4; r++) {
      const off = (r % 2) * 4;
      for (let c = -1; c <= 4; c++) {
        const sx = c * 8 + off;
        const sy = r * 8;
        ctx.fillStyle = (c + r) % 2 === 0 ? '#1d4ed8' : '#2563eb';
        ctx.fillRect(sx + 1, sy + 1, 6, 6);
        ctx.fillStyle = '#60a5fa'; ctx.fillRect(sx + 1, sy + 1, 6, 1);
        ctx.fillStyle = '#1e3a8a'; ctx.fillRect(sx + 1, sy + 6, 6, 1);
      }
    }
  });
  const castleTimber = makePixelTexture(32, (ctx) => {
    fillNoise(ctx, 32, ['#5c3419', '#4a2912', '#6e4020', '#3d200d'], 94);
    for (let y = 0; y < 32; y += 8) {
      ctx.fillStyle = '#291508'; ctx.fillRect(0, y, 32, 1);
      ctx.fillStyle = '#85512c'; ctx.fillRect(0, y + 1, 32, 1);
    }
  });
  const castleCarpet = makePixelTexture(32, (ctx) => {
    fillNoise(ctx, 32, ['#b91c1c', '#dc2626', '#991b1b', '#c81e1e'], 95);
    // Gold woven borders + diamond tapestry pattern
    ctx.fillStyle = '#facc15';
    ctx.fillRect(2, 0, 2, 32); ctx.fillRect(28, 0, 2, 32);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(14, 6, 4, 4); ctx.fillRect(14, 22, 4, 4);
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(5, 0, 1, 32); ctx.fillRect(26, 0, 1, 32);
  });
  const stainedGlass = makePixelTexture(32, (ctx) => {
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, 32, 32);
    // Jewel-toned cathedral stained glass panes!
    const panes = [
      [2, 2, 12, 12, '#0284c7', '#38bdf8'],
      [18, 2, 12, 12, '#7c3aed', '#c084fc'],
      [2, 18, 12, 12, '#eab308', '#fef08a'],
      [18, 18, 12, 12, '#e11d48', '#fb7185'],
    ];
    for (const [x, y, w, h, c1, c2] of panes) {
      ctx.fillStyle = c1; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = c2; ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 3, y + 3, 2, 2);
    }
    ctx.fillStyle = '#facc15';
    ctx.fillRect(14, 0, 4, 32); ctx.fillRect(0, 14, 32, 4);
  });
  const forgeBrick = makePixelTexture(32, (ctx) => {
    drawBevelBricks(ctx, 32, 4, 2, ['#334155', '#1e293b', '#475569', '#273244'], '#0f172a', '#64748b', '#0f172a', 96);
    // Glowing forge ember cracks
    ctx.fillStyle = '#f97316'; ctx.fillRect(6, 15, 6, 1); ctx.fillRect(20, 23, 5, 1);
  });
  const forgeRoof = makePixelTexture(32, (ctx) => {
    ctx.fillStyle = '#451a03'; ctx.fillRect(0, 0, 32, 32);
    for (let r = 0; r < 4; r++) {
      const off = (r % 2) * 4;
      for (let c = -1; c <= 4; c++) {
        const sx = c * 8 + off, sy = r * 8;
        ctx.fillStyle = (c + r) % 2 === 0 ? '#b91c1c' : '#9a3412';
        ctx.fillRect(sx + 1, sy + 1, 6, 6);
        ctx.fillStyle = '#fb923c'; ctx.fillRect(sx + 1, sy + 1, 6, 1);
      }
    }
  });
  const bookshelf = makePixelTexture(32, (ctx) => {
    ctx.fillStyle = '#5c3419'; ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#291508'; ctx.fillRect(2, 3, 28, 11); ctx.fillRect(2, 18, 28, 11);
    const bookCols = ['#dc2626', '#2563eb', '#16a34a', '#eab308', '#9333ea', '#0ea5e9', '#ea580c'];
    for (const sy of [4, 19]) {
      for (let bx = 3; bx < 28; bx += 4) {
        const bh = 8 + Math.floor(hash(bx, sy, 99) * 3);
        ctx.fillStyle = bookCols[Math.floor(hash(bx, sy, 100) * bookCols.length)];
        ctx.fillRect(bx, sy + (10 - bh), 3, bh);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(bx, sy + (10 - bh) + 2, 3, 1);
      }
    }
  });

  // --- FLAMING GRASS (32x32 Scorched Ember Turf + Blazing Molten Grass Blades!) ---
  const flamingGrassTop = makePixelTexture(32, (ctx) => {
    fillNoise(ctx, 32, ['#261414', '#381612', '#1d1012', '#4a1810'], 111);
    // Glowing lava-ember veins & fiery grass tufts
    for (let i = 0; i < 46; i++) {
      const gx = Math.floor(hash(i, 1, 112) * 30);
      const gy = Math.floor(hash(i, 2, 112) * 30);
      ctx.fillStyle = i % 4 === 0 ? '#fef08a' : (i % 3 === 0 ? '#fb923c' : '#ef4444');
      ctx.fillRect(gx, gy, 1, 2);
      if (i % 3 === 0) {
        ctx.fillStyle = '#f97316';
        ctx.fillRect(gx + 1, gy + 1, 1, 1);
      }
    }
    ctx.fillStyle = '#fde047';
    ctx.fillRect(6, 8, 2, 2); ctx.fillRect(22, 18, 2, 2); ctx.fillRect(14, 25, 2, 1);
  });
  const flamingGrassSide = makePixelTexture(32, (ctx) => {
    const ashPal = ['#2e1a18', '#231312', '#3d221c', '#1a0e0e'];
    const flamePal = ['#dc2626', '#f97316', '#fb923c', '#facc15'];
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const over = 7 + Math.floor(hash(Math.floor(x / 2), 0, 113) * 6);
        if (y < over) {
          ctx.fillStyle = y < 2 ? '#fef08a' : flamePal[Math.floor(hash(x, y, 114) * 4)];
        } else if (y === over || y === over + 1) {
          ctx.fillStyle = '#7f1d1d';
        } else {
          ctx.fillStyle = ashPal[Math.floor(hash(x, y, 115) * 4)];
        }
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Glowing volcanic magma embers embedded in charred soil
    ctx.fillStyle = '#f97316'; ctx.fillRect(6, 20, 3, 2); ctx.fillRect(20, 25, 3, 2);
    ctx.fillStyle = '#fde047'; ctx.fillRect(7, 20, 1, 1); ctx.fillRect(21, 25, 1, 1);
  });

  const mat = (tex, extra = {}) => new THREE.MeshLambertMaterial({ map: tex, ...extra });
  const dirtMat = mat(dirt);
  const grassSideMat = mat(grassSide);
  const grassTopMat = mat(grassTop);
  const flamingTopMat = mat(flamingGrassTop, { emissive: new THREE.Color('#ea580c'), emissiveIntensity: 0.35 });
  const flamingSideMat = mat(flamingGrassSide, { emissive: new THREE.Color('#9a3412'), emissiveIntensity: 0.25 });
  const cloudTopMat = mat(cloudTop, { emissive: new THREE.Color('#dbeafe'), emissiveIntensity: 0.12 });
  const cloudSideMat = mat(cloudSide, { emissive: new THREE.Color('#bfdbfe'), emissiveIntensity: 0.08 });
  const cloudBotMat = mat(cloudBottom);

  return {
    grassBlock: [grassSideMat, grassSideMat, grassTopMat, dirtMat, grassSideMat, grassSideMat],
    flamingGrassBlock: [flamingSideMat, flamingSideMat, flamingTopMat, dirtMat, flamingSideMat, flamingSideMat],
    cloudBlock: [cloudSideMat, cloudSideMat, cloudTopMat, cloudBotMat, cloudSideMat, cloudSideMat],
    cloudSub: cloudBotMat,
    skyMarble: mat(skyMarble, { emissive: new THREE.Color('#fef9c3'), emissiveIntensity: 0.06 }),
    mossyLog: mat(mossyLog),
    coralPink: mat(coralPinkTex, { emissive: new THREE.Color('#be123c'), emissiveIntensity: 0.22 }),
    coralTeal: mat(coralTealTex, { emissive: new THREE.Color('#0f766e'), emissiveIntensity: 0.22 }),
    coralOrange: mat(coralOrangeTex, { emissive: new THREE.Color('#c2410c'), emissiveIntensity: 0.22 }),
    crystalViolet: new THREE.MeshLambertMaterial({ color: 0xc084fc, emissive: 0x9333ea, emissiveIntensity: 0.72 }),
    crystalCyan: new THREE.MeshLambertMaterial({ color: 0x67e8f9, emissive: 0x0ea5e9, emissiveIntensity: 0.72 }),
    tallGrass: new THREE.MeshLambertMaterial({ color: 0x34d35a }),
    bushLeaves: mat(leaves),
    flowerGold: new THREE.MeshLambertMaterial({ color: 0xfacc15, emissive: 0xca8a04, emissiveIntensity: 0.3 }),
    flowerRose: new THREE.MeshLambertMaterial({ color: 0xfb7185, emissive: 0xe11d48, emissiveIntensity: 0.28 }),
    flowerSky: new THREE.MeshLambertMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.3 }),
    mushroomCap: new THREE.MeshLambertMaterial({ color: 0xef4444, emissive: 0x991b1b, emissiveIntensity: 0.22 }),
    mushroomStem: new THREE.MeshLambertMaterial({ color: 0xfef3c7 }),
    dirt: dirtMat,
    stone: mat(stone),
    mossyStone: mat(mossyStone),
    ruinBrick: mat(ruinBrick),
    goldStone: mat(goldStone, { emissive: new THREE.Color('#ca8a04'), emissiveIntensity: 0.16 }),
    wood: mat(wood),
    leaves: mat(leaves),
    sand: mat(sand),
    palmWood: mat(palmWood),
    palmLeaves: mat(palmLeaves),
    dockPlanks: mat(dockPlanks),
    sandstone: mat(sandstone),
    redRock: mat(redRock),
    cactus: mat(cactus),
    obsidian: mat(obsidian),
    runeStone: mat(runeStone, { emissive: new THREE.Color('#7e22ce'), emissiveIntensity: 0.38 }),
    chest: mat(chestTex, { emissive: new THREE.Color('#ca8a04'), emissiveIntensity: 0.25 }),
    water: new THREE.MeshLambertMaterial({
      map: water, transparent: true, opacity: 0.86,
      emissive: new THREE.Color('#0284c7'), emissiveIntensity: 0.35,
    }),
    jumpPad: new THREE.MeshLambertMaterial({
      map: jumpPad, emissive: new THREE.Color('#22d3ee'), emissiveIntensity: 0.5,
    }),
    cloud: new THREE.MeshLambertMaterial({ color: 0xf4f8ff, transparent: true, opacity: 0.9 }),
    movingPlatform: new THREE.MeshLambertMaterial({
      map: ruinBrick, emissive: new THREE.Color('#38bdf8'), emissiveIntensity: 0.32,
    }),
    // New 32x32 Architectural Castle, Forge, Store & Portal Materials!
    castleStone: mat(castleStone),
    castleDark: mat(castleDark),
    castleRoof: mat(castleRoof),
    castleTimber: mat(castleTimber),
    castleCarpet: mat(castleCarpet),
    stainedGlass: mat(stainedGlass, { emissive: new THREE.Color('#38bdf8'), emissiveIntensity: 0.65 }),
    forgeBrick: mat(forgeBrick),
    forgeRoof: mat(forgeRoof),
    bookshelf: mat(bookshelf),
  };
}
