const CACHE_NAME = 'skybound-relics-v4.16';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './assets/abilities/sky-glide.png',
  './assets/abilities/triple-jump.png',
  './assets/abilities/shockwave-slam.png',
  './assets/abilities/aegis-shield.png',
  './assets/abilities/sky-nova.png',
  './assets/vfx/vfx-sky-glide.png',
  './assets/vfx/vfx-glide-stream.png',
  './assets/vfx/vfx-glide-updraft.png',
  './assets/vfx/vfx-triple-jump.png',
  './assets/vfx/vfx-triple-leap-pillar.png',
  './assets/vfx/vfx-triple-cloud-ring.png',
  './assets/vfx/vfx-shockwave-slam.png',
  './assets/vfx/vfx-slam-pillar.png',
  './assets/vfx/vfx-slam-wave.png',
  './assets/vfx/vfx-aegis-shield.png',
  './assets/vfx/vfx-aegis-dome.png',
  './assets/vfx/vfx-aegis-thorns.png',
  './assets/vfx/vfx-sky-nova.png',
  './assets/vfx/vfx-nova-bolt.png',
  './assets/vfx/vfx-nova-shock.png',
  './src/vfxAssets.js',
  './lib/three.module.min.js',
  './src/config.js',
  './src/icons.js',
  './src/main.js',
  './src/state.js',
  './src/textures.js',
  './src/skyAndWater.js',
  './src/audio.js',
  './src/biomes.js',
  './src/hdAssets.js',
  './src/world.js',
  './src/combat.js',
  './src/player.js',
  './src/multiplayer.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/') || url.pathname.startsWith('/ws') || url.pathname.endsWith('/admin.html')) return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(event.request, clone)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
