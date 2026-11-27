// Crisp 16x16 Retro Pixel-Art Inline SVG Icons for Weapons, Arrows, Gear & HUD

function pxSvg(rects, size = 22, bg = 'rgba(15,23,42,0.75)') {
  return `<svg viewBox="0 0 16 16" width="${size}" height="${size}" style="image-rendering:pixelated;display:inline-block;vertical-align:middle;border:1px solid #475569;background:${bg};border-radius:3px;flex-shrink:0;">${rects}</svg>`;
}

export const HUD_ICONS = {
  bag: pxSvg(`
    <rect x="4" y="3" width="8" height="2" fill="#d97706"/>
    <rect x="3" y="5" width="10" height="8" fill="#92400e"/>
    <rect x="4" y="6" width="8" height="3" fill="#b45309"/>
    <rect x="7" y="8" width="2" height="3" fill="#facc15"/>
  `, 18),
  store: pxSvg(`
    <rect x="2" y="3" width="12" height="3" fill="#ef4444"/>
    <rect x="4" y="3" width="2" height="3" fill="#fef08a"/>
    <rect x="8" y="3" width="2" height="3" fill="#fef08a"/>
    <rect x="12" y="3" width="2" height="3" fill="#fef08a"/>
    <rect x="3" y="6" width="10" height="7" fill="#cbd5e1"/>
    <rect x="6" y="8" width="4" height="5" fill="#78350f"/>
  `, 18),
  quest: pxSvg(`
    <rect x="4" y="2" width="8" height="12" fill="#fef3c7"/>
    <rect x="3" y="2" width="10" height="2" fill="#d97706"/>
    <rect x="3" y="12" width="10" height="2" fill="#d97706"/>
    <rect x="6" y="5" width="4" height="1" fill="#92400e"/>
    <rect x="6" y="7" width="4" height="1" fill="#92400e"/>
    <rect x="6" y="9" width="3" height="1" fill="#92400e"/>
  `, 18),
  guild: pxSvg(`
    <rect x="3" y="2" width="10" height="7" fill="#38bdf8"/>
    <rect x="4" y="9" width="8" height="2" fill="#0284c7"/>
    <rect x="6" y="11" width="4" height="2" fill="#0284c7"/>
    <rect x="7" y="13" width="2" height="1" fill="#0369a1"/>
    <rect x="7" y="4" width="2" height="6" fill="#facc15"/>
    <rect x="5" y="6" width="6" height="2" fill="#facc15"/>
  `, 18),
  arena: pxSvg(`
    <rect x="11" y="2" width="3" height="3" fill="#f43f5e"/>
    <rect x="9" y="4" width="3" height="3" fill="#fda4af"/>
    <rect x="7" y="6" width="3" height="3" fill="#f43f5e"/>
    <rect x="5" y="8" width="3" height="3" fill="#e2e8f0"/>
    <rect x="2" y="11" width="4" height="3" fill="#facc15"/>
    <rect x="2" y="2" width="3" height="3" fill="#facc15"/>
    <rect x="4" y="4" width="3" height="3" fill="#fef08a"/>
    <rect x="9" y="8" width="3" height="3" fill="#e2e8f0"/>
    <rect x="10" y="11" width="4" height="3" fill="#f43f5e"/>
  `, 18),
  coin: pxSvg(`
    <rect x="5" y="2" width="6" height="12" fill="#facc15"/>
    <rect x="3" y="4" width="10" height="8" fill="#facc15"/>
    <rect x="6" y="4" width="2" height="8" fill="#fef08a"/>
    <rect x="9" y="5" width="2" height="6" fill="#ca8a04"/>
  `, 16),
  armor: pxSvg(`
    <rect x="4" y="3" width="8" height="3" fill="#38bdf8"/>
    <rect x="2" y="4" width="3" height="4" fill="#0ea5e9"/>
    <rect x="11" y="4" width="3" height="4" fill="#0ea5e9"/>
    <rect x="4" y="6" width="8" height="6" fill="#cbd5e1"/>
    <rect x="7" y="6" width="2" height="5" fill="#facc15"/>
  `, 22),
  chat: pxSvg(`
    <rect x="2" y="3" width="12" height="8" fill="#38bdf8"/>
    <rect x="4" y="11" width="3" height="2" fill="#38bdf8"/>
    <rect x="4" y="5" width="8" height="1" fill="#0f172a"/>
    <rect x="4" y="7" width="6" height="1" fill="#0f172a"/>
  `, 16),
};

export function getWeaponIcon(model, tintHex = '#e2e8f0', size = 24) {
  if (model === 'stone') {
    return pxSvg(`
      <rect x="5" y="4" width="6" height="8" fill="#94a3b8"/>
      <rect x="4" y="5" width="8" height="6" fill="#64748b"/>
      <rect x="5" y="5" width="4" height="3" fill="${tintHex}"/>
    `, size);
  }
  if (model === 'knife') {
    return pxSvg(`
      <rect x="3" y="11" width="3" height="2" fill="#92400e"/>
      <rect x="6" y="9" width="2" height="2" fill="#facc15"/>
      <rect x="8" y="7" width="2" height="2" fill="${tintHex}"/>
      <rect x="10" y="5" width="2" height="2" fill="${tintHex}"/>
      <rect x="11" y="3" width="2" height="2" fill="#ffffff"/>
    `, size);
  }
  if (model === 'dagger') {
    return pxSvg(`
      <rect x="3" y="11" width="2" height="2" fill="#78350f"/>
      <rect x="4" y="8" width="4" height="2" fill="#facc15"/>
      <rect x="7" y="6" width="3" height="3" fill="${tintHex}"/>
      <rect x="9" y="4" width="3" height="3" fill="${tintHex}"/>
      <rect x="11" y="2" width="2" height="2" fill="#ffffff"/>
    `, size);
  }
  if (model === 'bow') {
    return pxSvg(`
      <rect x="4" y="2" width="2" height="3" fill="#b45309"/>
      <rect x="6" y="4" width="2" height="8" fill="#92400e"/>
      <rect x="4" y="11" width="2" height="3" fill="#b45309"/>
      <rect x="4" y="5" width="1" height="6" fill="#f8fafc"/>
      <rect x="5" y="7" width="8" height="2" fill="${tintHex}"/>
      <rect x="12" y="6" width="2" height="4" fill="#facc15"/>
    `, size);
  }
  if (model === 'arrow') {
    return pxSvg(`
      <rect x="3" y="7" width="9" height="2" fill="#a8a29e"/>
      <rect x="2" y="6" width="3" height="4" fill="#fef08a"/>
      <rect x="11" y="5" width="3" height="6" fill="${tintHex}"/>
    `, size);
  }
  if (model === 'spear') {
    return pxSvg(`
      <rect x="2" y="12" width="2" height="2" fill="#92400e"/>
      <rect x="4" y="10" width="2" height="2" fill="#92400e"/>
      <rect x="6" y="8" width="2" height="2" fill="#92400e"/>
      <rect x="8" y="6" width="2" height="2" fill="#facc15"/>
      <rect x="10" y="3" width="4" height="4" fill="${tintHex}"/>
      <rect x="12" y="2" width="2" height="2" fill="#ffffff"/>
    `, size);
  }
  if (model === 'sword') {
    return pxSvg(`
      <rect x="2" y="12" width="3" height="2" fill="#78350f"/>
      <rect x="4" y="9" width="4" height="3" fill="#facc15"/>
      <rect x="7" y="7" width="3" height="3" fill="${tintHex}"/>
      <rect x="9" y="5" width="3" height="3" fill="${tintHex}"/>
      <rect x="11" y="2" width="3" height="3" fill="#ffffff"/>
    `, size);
  }
  return pxSvg(`
    <rect x="3" y="11" width="2" height="3" fill="#92400e"/>
    <rect x="5" y="9" width="2" height="3" fill="#92400e"/>
    <rect x="7" y="6" width="2" height="4" fill="#92400e"/>
    <rect x="5" y="3" width="4" height="4" fill="${tintHex}"/>
    <rect x="9" y="3" width="4" height="5" fill="${tintHex}"/>
    <rect x="7" y="4" width="2" height="3" fill="#facc15"/>
  `, size);
}
