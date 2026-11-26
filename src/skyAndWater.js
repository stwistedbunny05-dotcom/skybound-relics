// Skybound Relics — Minecraft/Roblox-Grade Procedural Sky Dome Shader, Sun/Moon/Stars,
// Multi-Layer Volumetric Voxel Clouds & Animated Caustic Stylized Water Shader!
import * as THREE from '../lib/three.module.min.js';

export const REALM_ATMOSPHERE = {
  haven: {
    zenith: '#1366d6', midSky: '#46a8ff', horizon: '#ffe9ba', nadir: '#8ec5fc',
    fog: '#b8e0ff', sunColor: '#fff5cc', sunGlow: '#ffcf6e',
    sunDir: [0.46, 0.58, 0.42], lightColor: 0xfff0cc, lightInt: 1.55,
    hemiSky: 0x9bd6ff, hemiGround: 0x3b6e58, hemiInt: 0.78,
    rimColor: 0x60a5fa, rimInt: 0.38, stars: 0.0, cloudTint: 0xffffff,
    waterDeep: '#0284c7', waterMid: '#06b6d4', waterFoam: '#e0faff',
  },
  forest: {
    zenith: '#0f5ec9', midSky: '#3ba6f5', horizon: '#d9f5c8', nadir: '#6eb5e8',
    fog: '#a8dff0', sunColor: '#fff8d4', sunGlow: '#fde047',
    sunDir: [0.52, 0.55, 0.35], lightColor: 0xfff3c4, lightInt: 1.58,
    hemiSky: 0x8fd3ff, hemiGround: 0x265c33, hemiInt: 0.76,
    rimColor: 0x4ade80, rimInt: 0.34, stars: 0.0, cloudTint: 0xf8fff8,
    waterDeep: '#0369a1', waterMid: '#14b8a6', waterFoam: '#d1fae5',
  },
  beach: {
    zenith: '#0277e0', midSky: '#1ec4f7', horizon: '#fff2c9', nadir: '#5eead4',
    fog: '#9ee8ff', sunColor: '#fff9db', sunGlow: '#fde68a',
    sunDir: [0.35, 0.68, 0.45], lightColor: 0xfff6d1, lightInt: 1.68,
    hemiSky: 0x7dd3fc, hemiGround: 0xc29b59, hemiInt: 0.82,
    rimColor: 0x2dd4bf, rimInt: 0.40, stars: 0.0, cloudTint: 0xffffff,
    waterDeep: '#0284c7', waterMid: '#22d3ee', waterFoam: '#ffffff',
  },
  desert: {
    zenith: '#9a3412', midSky: '#ea6c28', horizon: '#fde08d', nadir: '#c25929',
    fog: '#f5b971', sunColor: '#fffbeb', sunGlow: '#fb923c',
    sunDir: [0.62, 0.42, 0.30], lightColor: 0xffd79a, lightInt: 1.72,
    hemiSky: 0xfdba74, hemiGround: 0x7c3416, hemiInt: 0.76,
    rimColor: 0xf59e0b, rimInt: 0.42, stars: 0.12, cloudTint: 0xffe4b8,
    waterDeep: '#0e7490', waterMid: '#2dd4bf', waterFoam: '#fef3c7',
  },
  dungeon: {
    zenith: '#09071a', midSky: '#1e1642', horizon: '#4c2a85', nadir: '#0c081c',
    fog: '#261a4a', sunColor: '#e0f2fe', sunGlow: '#7c3aed',
    sunDir: [-0.40, 0.56, -0.45], lightColor: 0xb5c9ff, lightInt: 1.25,
    hemiSky: 0x6366f1, hemiGround: 0x1e1438, hemiInt: 0.68,
    rimColor: 0x38bdf8, rimInt: 0.55, stars: 0.95, cloudTint: 0x5b4a8a,
    waterDeep: '#1e1b4b', waterMid: '#4f46e5', waterFoam: '#a5f3fc',
  },
  arena: {
    zenith: '#1a0a2e', midSky: '#581c5c', horizon: '#f97316', nadir: '#2e1038',
    fog: '#6e2c6b', sunColor: '#fef08a', sunGlow: '#ef4444',
    sunDir: [0.45, 0.44, -0.50], lightColor: 0xffd2a6, lightInt: 1.55,
    hemiSky: 0xf472b6, hemiGround: 0x3b1330, hemiInt: 0.72,
    rimColor: 0xf43f5e, rimInt: 0.52, stars: 0.55, cloudTint: 0xfca5a5,
    waterDeep: '#7f1d1d', waterMid: '#dc2626', waterFoam: '#fef08a',
  },
};

export function createSkyDomeSystem(scene) {
  const skyGroup = new THREE.Group();
  scene.add(skyGroup);

  const uniforms = {
    uZenith:   { value: new THREE.Color('#1366d6') },
    uMidSky:   { value: new THREE.Color('#46a8ff') },
    uHorizon:  { value: new THREE.Color('#ffe9ba') },
    uNadir:    { value: new THREE.Color('#8ec5fc') },
    uSunDir:   { value: new THREE.Vector3(0.46, 0.58, 0.42).normalize() },
    uSunColor: { value: new THREE.Color('#fff5cc') },
    uSunGlow:  { value: new THREE.Color('#ffcf6e') },
    uStars:    { value: 0.0 },
    uTime:     { value: 0.0 },
  };

  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms,
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uZenith;
      uniform vec3 uMidSky;
      uniform vec3 uHorizon;
      uniform vec3 uNadir;
      uniform vec3 uSunDir;
      uniform vec3 uSunColor;
      uniform vec3 uSunGlow;
      uniform float uStars;
      uniform float uTime;
      varying vec3 vDir;

      float hash3(vec3 p) {
        p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }

      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col;
        if (h >= 0.0) {
          float t1 = smoothstep(0.0, 0.26, h);
          float t2 = smoothstep(0.20, 0.85, h);
          col = mix(uHorizon, uMidSky, t1);
          col = mix(col, uZenith, t2);
        } else {
          col = mix(uHorizon, uNadir, smoothstep(0.0, -0.45, h));
        }

        // Warm horizon sunset/sunlight bloom + crisp Minecraft-style square sun halo!
        float sunAmt = max(dot(d, normalize(uSunDir)), 0.0);
        col += uSunGlow * pow(sunAmt, 6.0) * 0.42;
        col += uSunColor * pow(sunAmt, 42.0) * 0.85;
        // Crisp sunlit disc
        float disc = smoothstep(0.9965, 0.9985, sunAmt);
        col = mix(col, uSunColor * 1.25, disc);

        // Twinkling voxel starfield in Dungeon, Arena & Dusk skies
        if (uStars > 0.01 && h > 0.04) {
          vec3 grid = floor(d * 110.0);
          float s = hash3(grid);
          if (s > 0.992) {
            float tw = 0.55 + 0.45 * sin(uTime * 2.8 + s * 90.0);
            col += vec3(0.92, 0.96, 1.0) * tw * uStars * smoothstep(0.04, 0.3, h);
          }
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  const dome = new THREE.Mesh(new THREE.SphereGeometry(215, 28, 18), skyMat);
  skyGroup.add(dome);

  // Stylized Minecraft-style 3D Pixel Sun / Moon Billboard Cube in the sky
  const sunGroup = new THREE.Group();
  const sunCoreMat = new THREE.MeshBasicMaterial({ color: 0xfff9db, fog: false });
  const sunRimMat = new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.48, fog: false });
  const sunCore = new THREE.Mesh(new THREE.BoxGeometry(14, 14, 14), sunCoreMat);
  const sunRim = new THREE.Mesh(new THREE.BoxGeometry(21, 21, 21), sunRimMat);
  sunGroup.add(sunCore, sunRim);
  skyGroup.add(sunGroup);

  // Volumetric Multi-Layer Voxel Cloud Deck (high sunlit clouds + lower sea of clouds!)
  const cloudGroup = new THREE.Group();
  const cloudMatTop = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.92, fog: true });
  const cloudMatLow = new THREE.MeshLambertMaterial({ color: 0xdbeafe, transparent: true, opacity: 0.72, fog: true });
  const cloudList = [];
  for (let i = 0; i < 24; i++) {
    const cg = new THREE.Group();
    const isLow = i >= 16;
    const mat = isLow ? cloudMatLow : cloudMatTop;
    const w1 = (isLow ? 16 : 9) + (i % 4) * 4;
    const d1 = (isLow ? 12 : 6) + (i % 3) * 3;
    const h1 = isLow ? 2.4 : 2.8;
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(w1, h1, d1), mat);
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(w1 * 0.65, h1 * 0.85, d1 * 0.75), mat);
    b2.position.set(w1 * 0.14, h1 * 0.62, d1 * 0.08);
    const b3 = new THREE.Mesh(new THREE.BoxGeometry(w1 * 0.45, h1 * 0.65, d1 * 0.6), mat);
    b3.position.set(-w1 * 0.22, h1 * 0.35, -d1 * 0.12);
    cg.add(b1, b2, b3);
    const ang = (i / 24) * Math.PI * 2;
    const rad = isLow ? (48 + (i % 4) * 26) : (36 + (i % 5) * 24);
    const baseY = isLow ? (-22 - (i % 3) * 6) : (34 + (i % 4) * 7);
    cg.position.set(Math.cos(ang) * rad, baseY, Math.sin(ang) * rad);
    cloudGroup.add(cg);
    cloudList.push({ mesh: cg, speed: isLow ? 1.1 : (1.5 + (i % 4) * 0.45), rad });
  }
  skyGroup.add(cloudGroup);

  function setAtmosphere(worldId, lights, customFogHex = null) {
    const p = REALM_ATMOSPHERE[worldId] || REALM_ATMOSPHERE.haven;
    uniforms.uZenith.value.set(p.zenith);
    uniforms.uMidSky.value.set(p.midSky);
    uniforms.uHorizon.value.set(p.horizon);
    uniforms.uNadir.value.set(p.nadir);
    uniforms.uSunColor.value.set(p.sunColor);
    uniforms.uSunGlow.value.set(p.sunGlow);
    uniforms.uSunDir.value.set(p.sunDir[0], p.sunDir[1], p.sunDir[2]).normalize();
    uniforms.uStars.value = p.stars;

    sunCoreMat.color.set(p.sunColor);
    sunRimMat.color.set(p.sunGlow);
    sunGroup.position.copy(uniforms.uSunDir.value).multiplyScalar(170);
    sunGroup.lookAt(0, 0, 0);

    cloudMatTop.color.setHex(p.cloudTint);
    cloudMatLow.color.setHex(p.cloudTint).multiplyScalar(0.86);

    scene.fog.color.set(customFogHex || p.fog);
    if (lights?.sun) {
      lights.sun.color.setHex(p.lightColor);
      lights.sun.intensity = p.lightInt;
    }
    if (lights?.hemi) {
      lights.hemi.color.setHex(p.hemiSky);
      lights.hemi.groundColor.setHex(p.hemiGround);
      lights.hemi.intensity = p.hemiInt;
    }
    if (lights?.rim) {
      lights.rim.color.setHex(p.rimColor);
      lights.rim.intensity = p.rimInt;
    }
  }

  function update(dt, elapsed, centerPos) {
    uniforms.uTime.value = elapsed;
    if (centerPos) {
      dome.position.set(centerPos.x, centerPos.y * 0.2, centerPos.z);
      sunGroup.position.copy(uniforms.uSunDir.value).multiplyScalar(170).add(dome.position);
    }
    for (const c of cloudList) {
      c.mesh.position.x += c.speed * dt;
      if (c.mesh.position.x > 145) c.mesh.position.x = -145;
    }
  }

  return { skyGroup, setAtmosphere, update };
}

// =========================================================================
// ANIMATED STYLIZED PIXEL-CAUSTIC WATER SHADER (Minecraft Shaders + Roblox!)
// =========================================================================
export function createStylizedWaterMaterial(worldId = 'haven') {
  const p = REALM_ATMOSPHERE[worldId] || REALM_ATMOSPHERE.haven;
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    uniforms: {
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color(p.waterDeep) },
      uMid:  { value: new THREE.Color(p.waterMid) },
      uFoam: { value: new THREE.Color(p.waterFoam) },
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        // Gentle stylized wave undulation
        wp.y += sin(wp.x * 0.9 + uTime * 2.4) * 0.045 + cos(wp.z * 0.85 + uTime * 1.9) * 0.045;
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uDeep;
      uniform vec3 uMid;
      uniform vec3 uFoam;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      // Pixel-quantized cellular caustic shimmer (Minecraft/Roblox stylized water!)
      float waveCell(vec2 p) {
        vec2 gp = floor(p * 3.5) / 3.5;
        float w1 = sin(gp.x * 1.7 + uTime * 2.2) * cos(gp.y * 1.5 - uTime * 1.7);
        float w2 = sin((gp.x + gp.y) * 1.2 - uTime * 1.9);
        return (w1 + w2) * 0.5;
      }

      void main() {
        vec2 wp = vWorldPos.xz;
        float w = waveCell(wp * 0.72);
        float w2 = waveCell(wp * 1.25 + vec2(3.1, -2.4));

        // 3-tone crisp stylized color ramp
        vec3 col = mix(uDeep, uMid, smoothstep(-0.45, 0.35, w));
        // Sparkling sunlit caustic crests
        float caustic = smoothstep(0.46, 0.68, w + w2 * 0.55);
        col = mix(col, uFoam, caustic * 0.72);

        // Crisp white shoreline edge foam around water pool borders
        float edge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
        float foamEdge = 1.0 - smoothstep(0.0, 0.09 + sin(uTime * 3.0 + wp.x * 1.5) * 0.02, edge);
        col = mix(col, uFoam, foamEdge * 0.82);

        // Subtle pixel sparkle glints
        vec2 sp = floor(wp * 4.0);
        float spark = fract(sin(dot(sp, vec2(12.9898, 78.233))) * 43758.5453);
        if (spark > 0.96 && sin(uTime * 5.0 + spark * 40.0) > 0.65) {
          col = mix(col, vec3(1.0), 0.75);
        }

        gl_FragColor = vec4(col, 0.88);
      }
    `,
  });
}
