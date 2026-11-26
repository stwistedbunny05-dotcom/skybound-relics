// Pure Web Audio API 16-bit Fantasy RPG 6-World Soundtrack & SFX Engine ($0, zero external files)

// Exact equal-temperament note-to-Hz helper (e.g. 'C5', 'G#4', 'Bb3', '-' for rest)
const NOTE_SEMITONES = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};
function noteHz(name) {
  if (!name || name === '-') return 0;
  const m = /^([A-G][#b]?)(\d)$/.exec(name);
  if (!m) return 0;
  const midi = (parseInt(m[2], 10) + 1) * 12 + NOTE_SEMITONES[m[1]];
  return 440 * Math.pow(2, (midi - 69) / 12);
}
function seq(str) {
  return str.trim().split(/\s+/).map(noteHz);
}

// =========================================================================
// 6 ORIGINAL WORLD SOUNDTRACKS (4-Channel: Lead + Harmony/Arp + Bass + Drums)
//   1. haven   — Safe Haven ("Citadel Above the Clouds")
//   2. forest  — Sky Forest ("Emerald Canopy Winds")
//   3. beach   — Sky Beach ("Sunlit Coral Shores")
//   4. dungeon — Sky Dungeon ("Vault of Blue Soul-Fire")
//   5. desert  — Sky Desert ("Sands of the Sun Pharaoh")
//   6. arena   — Duel Arena ("Colosseum of Champions")
// =========================================================================
const WORLD_SOUNDTRACKS = {
  haven: {
    id: 'haven',
    title: 'Safe Haven — Citadel Above the Clouds',
    stepMs: 196,
    leadType: 'triangle', leadVol: 0.044, leadDur: 0.24,
    arpType: 'sine',      arpVol: 0.022,  arpDur: 0.17,
    bassType: 'triangle', bassVol: 0.042, bassDur: 0.30,
    drumStyle: 'haven',
    // Warm, peaceful medieval castle & cloud sanctuary melody (C Major)
    lead: seq(
      'E5 - G5 - C6 - B5 G5  A5 - G5 E5 D5 - - - ' +
      'C5 - E5 - G5 - A5 G5  E5 - D5 - C5 - - - ' +
      'G5 - A5 - C6 - D6 C6  B5 - A5 G5 E5 - - - ' +
      'F5 - A5 - G5 - E5 D5  C5 - - - - - - -'
    ),
    arp: seq(
      'C4 E4 G4 E4 C4 E4 G4 E4  F4 A4 C5 A4 G4 B4 D5 B4 ' +
      'A3 C4 E4 C4 E4 G4 C5 G4  F4 A4 G4 B4 C4 E4 G4 E4 ' +
      'C4 E4 G4 C5 F4 A4 C5 A4  G4 B4 D5 B4 E4 G4 B4 G4 ' +
      'F4 A4 C5 A4 G4 B4 D5 G4  C4 E4 G4 C5 G4 E4 C4 -'
    ),
    bass: seq(
      'C3 - - - G2 - - -  F2 - - - G2 - - - ' +
      'A2 - - - E2 - - -  F2 - G2 - C3 - G2 - ' +
      'C3 - - - F2 - - -  G2 - - - E2 - - - ' +
      'F2 - - - G2 - - -  C3 - - - C3 - - -'
    ),
    drums: 'k . . . . . h .  k . . . s . h .  k . . . . . h .  k . . . s . . .' .split(/\s+/),
  },

  forest: {
    id: 'forest',
    title: 'Sky Forest — Emerald Canopy Winds',
    stepMs: 160,
    leadType: 'square',   leadVol: 0.024, leadDur: 0.16,
    arpType: 'triangle',  arpVol: 0.026,  arpDur: 0.14,
    bassType: 'triangle', bassVol: 0.044, bassDur: 0.22,
    drumStyle: 'forest',
    // Bright, adventurous JRPG woodland melody (G Major / E Dorian)
    lead: seq(
      'G5 A5 B5 - D6 - B5 A5  G5 - E5 G5 A5 - - - ' +
      'B5 - A5 G5 E5 - D5 E5  G5 - A5 B5 A5 - - - ' +
      'D6 - E6 D6 B5 - A5 G5  A5 - B5 A5 G5 - E5 - ' +
      'D5 E5 G5 A5 B5 - A5 G5  G5 - - - - - - -'
    ),
    arp: seq(
      'G3 B3 D4 B3 G3 B3 D4 B3  E3 G3 B3 G3 D3 F#3 A3 F#3 ' +
      'C3 E3 G3 E3 G3 B3 D4 B3  C3 E3 G3 E3 D3 F#3 A3 D4 ' +
      'G3 B3 D4 B3 E3 G3 B3 G3  C3 E3 G3 E3 D3 F#3 A3 F#3 ' +
      'C3 E3 G3 C4 D3 F#3 A3 D4  G3 B3 D4 G4 D4 B3 G3 -'
    ),
    bass: seq(
      'G2 - D3 - G2 - D3 -  E2 - B2 - D2 - A2 - ' +
      'C3 - G2 - G2 - D3 -  C3 - G2 - D2 - A2 - ' +
      'G2 - D3 - E2 - B2 -  C3 - G2 - D2 - A2 - ' +
      'C3 - G2 - D2 - A2 -  G2 - D3 - G2 - - -'
    ),
    drums: 'k . h . s . h .  k . h k s . h .  k . h . s . h .  k h s h k . s .' .split(/\s+/),
  },

  beach: {
    id: 'beach',
    title: 'Sky Beach — Sunlit Coral Shores',
    stepMs: 170,
    leadType: 'sine',     leadVol: 0.052, leadDur: 0.15,
    arpType: 'triangle',  arpVol: 0.025,  arpDur: 0.12,
    bassType: 'triangle', bassVol: 0.045, bassDur: 0.22,
    drumStyle: 'beach',
    // Breezy tropical island marimba & steel-pan groove (F Major)
    lead: seq(
      'A5 - C6 - - A5 G5 F5  G5 - A5 - C6 - - - ' +
      'D6 - C6 A5 - G5 F5 G5  A5 - - G5 F5 - - - ' +
      'C6 - D6 - - C6 A5 G5  A5 - C6 - D6 - - - ' +
      'F6 - D6 C6 A5 - G5 A5  F5 - - - - - - -'
    ),
    arp: seq(
      '- F4 A4 C5 - F4 A4 C5  - G4 Bb4 D5 - C4 E4 G4 ' +
      '- Bb3 D4 F4 - C4 E4 G4  - F4 A4 C5 - F4 A4 - ' +
      '- F4 A4 C5 - A4 C5 F5  - Bb4 D5 F5 - G4 Bb4 D5 ' +
      '- C4 E4 G4 - C4 G4 Bb4  - F4 A4 C5 F4 A4 C5 -'
    ),
    bass: seq(
      'F2 - - F2 C3 - F2 -  G2 - - G2 C3 - G2 - ' +
      'Bb2 - - Bb2 C3 - G2 -  F2 - C3 - F2 - C3 - ' +
      'F2 - - F2 A2 - C3 -  Bb2 - - Bb2 G2 - D3 - ' +
      'C3 - - G2 C3 - G2 -  F2 - C3 - F2 - - -'
    ),
    drums: 'k . h h s . h .  k . h . s . h h  k . h h s . h .  k . s h . h s .' .split(/\s+/),
  },

  dungeon: {
    id: 'dungeon',
    title: 'Sky Dungeon — Vault of Blue Soul-Fire',
    stepMs: 186,
    leadType: 'sawtooth', leadVol: 0.020, leadDur: 0.22,
    arpType: 'square',    arpVol: 0.015,  arpDur: 0.14,
    bassType: 'sawtooth', bassVol: 0.028, bassDur: 0.28,
    drumStyle: 'dungeon',
    // Dark gothic cathedral organ & soul-fire crypt theme (D Harmonic Minor)
    lead: seq(
      'D5 - F5 E5 D5 - C#5 -  D5 - A4 - - - - - ' +
      'Bb4 - A4 G4 F4 - E4 -  A4 - - - - - - - ' +
      'D5 - F5 A5 G5 - F5 E5  F5 - D5 - C#5 - A4 - ' +
      'Bb4 - G4 - A4 - C#5 -  D5 - - - - - - -'
    ),
    arp: seq(
      'D3 F3 A3 F3 D3 F3 A3 F3  C#3 E3 A3 E3 D3 F3 A3 F3 ' +
      'Bb2 D3 F3 D3 G2 Bb2 D3 Bb2  A2 C#3 E3 A3 E3 C#3 A2 - ' +
      'D3 F3 A3 D4 G3 Bb3 D4 Bb3  F3 A3 D4 A3 E3 A3 C#4 A3 ' +
      'Bb2 D3 G3 D3 A2 C#3 E3 G3  D3 F3 A3 D4 A3 F3 D3 -'
    ),
    bass: seq(
      'D2 - - - D2 - C#2 -  D2 - - - A1 - - - ' +
      'Bb1 - - - G1 - - -  A1 - - - A1 - E2 - ' +
      'D2 - - - G1 - - -  F1 - - - A1 - - - ' +
      'Bb1 - G1 - A1 - A1 -  D2 - - - D2 - - -'
    ),
    drums: 'k . . . h . s .  k . . . h . . .  k . . . h . s .  k . k . s . h .' .split(/\s+/),
  },

  desert: {
    id: 'desert',
    title: 'Sky Desert — Sands of the Sun Pharaoh',
    stepMs: 166,
    leadType: 'square',   leadVol: 0.025, leadDur: 0.17,
    arpType: 'triangle',  arpVol: 0.025,  arpDur: 0.14,
    bassType: 'triangle', bassVol: 0.044, bassDur: 0.22,
    drumStyle: 'desert',
    // Exotic Egyptian / Sun-Pharaoh Phrygian Dominant theme (E–F–G#–A–B–C–D)
    lead: seq(
      'E5 - F5 G#5 A5 - G#5 F5  E5 - - F5 G#5 - - - ' +
      'B5 - C6 B5 A5 - G#5 F5  G#5 - F5 E5 E5 - - - ' +
      'E5 G#5 B5 - C6 - B5 A5  G#5 - A5 G#5 F5 - E5 - ' +
      'F5 - G#5 F5 E5 - D5 F5  E5 - - - - - - -'
    ),
    arp: seq(
      'E3 B3 E4 B3 F3 C4 F4 C4  E3 G#3 B3 E4 E3 G#3 B3 - ' +
      'E3 B3 E4 B3 A3 C4 E4 C4  E3 G#3 B3 E4 E3 B3 E4 - ' +
      'E3 G#3 B3 E4 F3 A3 C4 F4  E3 G#3 B3 E4 D3 F3 A3 D4 ' +
      'F3 A3 C4 F4 D3 F3 A3 F3  E3 G#3 B3 E4 B3 G#3 E3 -'
    ),
    bass: seq(
      'E2 - B2 - F2 - C3 -  E2 - B2 - E2 - B2 - ' +
      'E2 - B2 - A2 - E2 -  E2 - B2 - E2 - B2 - ' +
      'E2 - B2 - F2 - C3 -  E2 - B2 - D2 - A2 - ' +
      'F2 - C3 - D2 - A2 -  E2 - B2 - E2 - - -'
    ),
    drums: 'k . s . k s . h  k . s . k . s h  k . s . k s . h  k s k s k . s .' .split(/\s+/),
  },

  arena: {
    id: 'arena',
    title: 'Duel Arena — Colosseum of Champions',
    stepMs: 134,
    leadType: 'sawtooth', leadVol: 0.025, leadDur: 0.14,
    arpType: 'square',    arpVol: 0.017,  arpDur: 0.10,
    bassType: 'sawtooth', bassVol: 0.032, bassDur: 0.14,
    drumStyle: 'arena',
    // High-energy heroic boss/duel battle anthem (A Minor / Power Chords)
    lead: seq(
      'A5 - A5 G5 A5 - C6 -  B5 - G5 - E5 - - - ' +
      'A5 - A5 G5 A5 - D6 -  C6 - B5 A5 G5 - E5 - ' +
      'F5 - G5 A5 C6 - B5 A5  G5 - A5 B5 D6 - C6 B5 ' +
      'A5 - E6 - D6 - C6 B5  A5 - - - A5 - - -'
    ),
    arp: seq(
      'A3 C4 E4 A4 A3 C4 E4 A4  G3 B3 D4 G4 E3 G3 B3 E4 ' +
      'A3 C4 E4 A4 D3 F3 A3 D4  C4 E4 G4 C5 G3 B3 D4 G4 ' +
      'F3 A3 C4 F4 F3 A3 C4 F4  G3 B3 D4 G4 G3 B3 D4 G4 ' +
      'A3 C4 E4 A4 E3 G#3 B3 E4  A3 C4 E4 A4 E4 C4 A3 -'
    ),
    bass: seq(
      'A2 A2 E2 A2 A2 A2 E2 A2  G2 G2 D2 G2 E2 E2 B1 E2 ' +
      'A2 A2 E2 A2 D2 D2 A1 D2  C2 C2 G1 C2 G2 G2 D2 G2 ' +
      'F2 F2 C2 F2 F2 F2 C2 F2  G2 G2 D2 G2 G2 G2 D2 G2 ' +
      'A2 A2 E2 A2 E2 E2 B1 E2  A2 A2 E2 A2 A2 - - -'
    ),
    drums: 'k h s h k k s h  k h s h k s s h  k h s h k k s h  k s k s k k s .' .split(/\s+/),
  },
};

class RetroAudio {
  constructor() {
    this.ctx = null;
    this.bgmGain = null;
    this.muted = false;
    this.bgmOn = true;
    this.bgmTimer = null;
    this.step = 0;
    this.currentTrack = 'haven';
  }

  getTrack(id = this.currentTrack) {
    return WORLD_SOUNDTRACKS[id] || WORLD_SOUNDTRACKS.haven;
  }

  getTrackTitle(id = this.currentTrack) {
    return this.getTrack(id).title;
  }

  ensureBgmBus() {
    if (!this.ctx) return null;
    if (!this.bgmGain) {
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 1.0;
      this.bgmGain.connect(this.ctx.destination);
    }
    return this.bgmGain;
  }

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.ensureBgmBus();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.bgmOn && !this.bgmTimer) {
      this.startBgm();
    }
  }

  setTrack(worldId) {
    const nextId = WORLD_SOUNDTRACKS[worldId] ? worldId : 'haven';
    const changed = nextId !== this.currentTrack;
    this.currentTrack = nextId;
    if (!changed && this.bgmTimer) return false;

    this.step = 0;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.ctx && this.bgmGain) {
      const now = this.ctx.currentTime;
      this.bgmGain.gain.cancelScheduledValues(now);
      this.bgmGain.gain.setValueAtTime(0.001, now);
      this.bgmGain.gain.linearRampToValueAtTime(1.0, now + 0.45);
    }
    if (this.bgmOn && this.ctx) {
      this.startBgm();
    }
    return changed;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  toggleBgm() {
    this.bgmOn = !this.bgmOn;
    if (this.bgmOn) {
      this.unlock();
      this.startBgm();
    } else if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    return this.bgmOn;
  }

  tone(freq, dur, type = 'square', vol = 0.08, slideTo = null, delay = 0, dest = null) {
    if (this.muted || !this.ctx || freq <= 0) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + dur);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain);
    gain.connect(dest || this.ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  noise(dur = 0.12, vol = 0.06, highpass = 1200, dest = null) {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = highpass;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(dest || this.ctx.destination);
    src.start(now);
  }

  playBgmDrum(hit, style, dest) {
    if (hit === '.' || !hit) return;
    if (hit === 'k') {
      const startHz = style === 'dungeon' ? 95 : (style === 'arena' ? 145 : 120);
      const endHz = style === 'dungeon' ? 36 : 45;
      const vol = style === 'haven' ? 0.028 : (style === 'arena' ? 0.055 : 0.042);
      this.tone(startHz, 0.11, 'triangle', vol, endHz, 0, dest);
    } else if (hit === 's') {
      if (style === 'desert' || style === 'beach') {
        this.tone(240, 0.065, 'triangle', 0.032, 130, 0, dest);
        this.noise(0.045, 0.018, 2200, dest);
      } else if (style === 'haven') {
        this.tone(360, 0.04, 'sine', 0.018, 220, 0, dest);
      } else {
        this.noise(0.075, style === 'arena' ? 0.034 : 0.024, 1400, dest);
        this.tone(180, 0.06, 'triangle', 0.024, 90, 0, dest);
      }
    } else if (hit === 'h') {
      this.noise(0.03, style === 'haven' ? 0.009 : 0.014, 4800, dest);
    }
  }

  startBgm() {
    if (this.bgmTimer) return;
    const tr = this.getTrack();
    const bus = this.ensureBgmBus();
    this.bgmTimer = setInterval(() => {
      if (this.muted || !this.bgmOn || !this.ctx || this.ctx.state !== 'running') return;
      const t = this.getTrack();
      const idx = this.step;
      const m = t.lead[idx % t.lead.length];
      const a = t.arp[idx % t.arp.length];
      const b = t.bass[idx % t.bass.length];
      const d = t.drums[idx % t.drums.length];
      const dest = bus || this.ctx.destination;
      if (m > 0) this.tone(m, t.leadDur, t.leadType, t.leadVol, null, 0, dest);
      if (a > 0) this.tone(a, t.arpDur, t.arpType, t.arpVol, null, 0, dest);
      if (b > 0) this.tone(b, t.bassDur, t.bassType, t.bassVol, null, 0, dest);
      if (d && d !== '.') this.playBgmDrum(d, t.drumStyle, dest);
      this.step++;
    }, tr.stepMs);
  }

  playJump() {
    this.tone(240, 0.14, 'square', 0.07, 520);
  }

  playDoubleJump() {
    this.tone(360, 0.11, 'square', 0.075, 760);
    this.tone(540, 0.14, 'triangle', 0.06, 980, 0.05);
  }

  playDash() {
    this.noise(0.16, 0.09, 900);
    this.tone(420, 0.14, 'sawtooth', 0.06, 180);
  }

  playLand() {
    this.tone(120, 0.07, 'triangle', 0.06, 55);
  }

  playBounce() {
    this.tone(200, 0.24, 'square', 0.085, 860);
    this.tone(300, 0.2, 'triangle', 0.06, 1100, 0.05);
  }

  playShard() {
    this.tone(880, 0.08, 'square', 0.06);
    this.tone(1174.66, 0.12, 'square', 0.06, null, 0.06);
  }

  playCheckpoint() {
    this.tone(440, 0.09, 'triangle', 0.07);
    this.tone(554.37, 0.09, 'triangle', 0.07, null, 0.08);
    this.tone(659.25, 0.16, 'triangle', 0.07, null, 0.16);
  }

  playRelic() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => this.tone(n, 0.18, 'square', 0.07, null, i * 0.085));
  }

  playUnlock() {
    const notes = [392.0, 523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, i) => this.tone(n, 0.2, 'square', 0.075, null, i * 0.075));
  }

  playFall() {
    this.tone(320, 0.35, 'sawtooth', 0.06, 85);
  }

  playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5];
    notes.forEach((n, i) => this.tone(n, 0.24, 'square', 0.08, null, i * 0.1));
  }

  playThrow() {
    this.tone(310, 0.09, 'triangle', 0.075, 160);
  }

  playPunch() {
    this.noise(0.08, 0.09, 400);
    this.tone(180, 0.1, 'sawtooth', 0.08, 70);
  }

  playShoot(isEnemy = false) {
    if (isEnemy) {
      this.tone(520, 0.12, 'sawtooth', 0.055, 220);
    } else {
      this.tone(760, 0.1, 'square', 0.065, 290);
    }
  }

  playEnemyHit() {
    this.tone(240, 0.07, 'square', 0.08, 120);
    this.noise(0.05, 0.06, 1500);
  }

  playEnemyDie() {
    this.noise(0.18, 0.1, 600);
    this.tone(360, 0.14, 'sawtooth', 0.08, 95);
    this.tone(210, 0.2, 'square', 0.07, 55, 0.09);
  }

  playPlayerHurt() {
    this.tone(190, 0.18, 'sawtooth', 0.09, 75);
    this.noise(0.12, 0.08, 500);
  }

  playPickupWeapon() {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((n, i) => this.tone(n, 0.11, 'square', 0.07, null, i * 0.055));
  }

  playLevelClear() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => this.tone(n, 0.18, 'square', 0.075, null, i * 0.09));
  }

  playGameOver() {
    const notes = [330, 293.66, 246.94, 196];
    notes.forEach((n, i) => this.tone(n, 0.22, 'sawtooth', 0.075, null, i * 0.12));
  }

  playCoin() {
    this.tone(987.77, 0.06, 'square', 0.06);
    this.tone(1318.5, 0.13, 'square', 0.06, null, 0.055);
  }

  playBow() {
    this.tone(360, 0.09, 'triangle', 0.07, 190);
    this.noise(0.05, 0.05, 1800);
  }

  playSlash() {
    this.noise(0.1, 0.08, 1000);
    this.tone(260, 0.1, 'sawtooth', 0.065, 110);
  }

  playChestOpen() {
    const notes = [392, 493.88, 587.33, 783.99, 987.77, 1174.66];
    notes.forEach((n, i) => this.tone(n, 0.16, 'square', 0.075, null, i * 0.07));
  }

  playUpgrade() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, i) => this.tone(n, 0.14, 'triangle', 0.08, null, i * 0.06));
  }

  playPortal() {
    this.tone(260, 0.28, 'sine', 0.08, 780);
    this.tone(390, 0.25, 'triangle', 0.06, 1040, 0.05);
  }

  playSave() {
    this.tone(587.33, 0.09, 'triangle', 0.07);
    this.tone(880, 0.16, 'triangle', 0.07, null, 0.08);
  }

  playHeartPickup() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => this.tone(n, 0.11, 'triangle', 0.08, null, i * 0.055));
  }

  playWaterSplash() {
    this.noise(0.18, 0.09, 950);
    this.tone(280, 0.09, 'sine', 0.065, 520, 0.01);
    this.tone(420, 0.11, 'triangle', 0.05, 760, 0.05);
  }
}

export const audio = new RetroAudio();
