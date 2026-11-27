import * as THREE from '../lib/three.module.min.js';

// Shared Cached Loader for Custom 3D Additive-Blending Ability VFX Textures (v4.14)
const VFX_PATHS = {
  skyGlide:      './assets/vfx/vfx-sky-glide.png',
  tripleJump:    './assets/vfx/vfx-triple-jump.png',
  shockwaveSlam: './assets/vfx/vfx-shockwave-slam.png',
  aegisShield:   './assets/vfx/vfx-aegis-shield.png',
  skyNova:       './assets/vfx/vfx-sky-nova.png',
};

const loader = new THREE.TextureLoader();
const cache = {};

export function getAbilityVfxTexture(key) {
  if (!VFX_PATHS[key]) return null;
  if (!cache[key]) {
    const tex = loader.load(VFX_PATHS[key]);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.userData = { sharedVfx: true };
    cache[key] = tex;
  }
  return cache[key];
}

export function makeAdditiveVfxMaterial(key, opacity = 0.96, color = 0xffffff) {
  return new THREE.MeshBasicMaterial({
    map: getAbilityVfxTexture(key),
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  });
}
