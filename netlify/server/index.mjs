// Skybound Relics — All-in-One Netlify Server WebSocket Multiplayer Backend
// Handles 50–200+ concurrent WebSocket players on a single small Netlify Server instance!
// Event-driven (zero keep-alive timers, clean scale-to-zero & 1012 graceful reconnects).
import { upgradeWebSocket, onShutdown, getWebSockets } from '@netlify/server';

export const config = {
  path: ['/ws', '/api/mp/*'],
};

const MAX_PLAYERS = 120;
const players = new Map(); // id -> { id, ws, name, tag, worldId, levelNum, x, y, z, yaw, anim, weaponId, weaponLvl, armorLvl, avatar }
let nextId = 1;

function safeSend(ws, obj) {
  try {
    if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj));
  } catch {
    // ignore closed socket
  }
}

function broadcastAll(obj, excludeId = null) {
  const payload = JSON.stringify(obj);
  for (const p of players.values()) {
    if (p.id === excludeId) continue;
    try {
      if (p.ws && p.ws.readyState === 1) p.ws.send(payload);
    } catch {
      // ignore
    }
  }
}

function broadcastZone(worldId, levelNum, obj, excludeId = null) {
  const payload = JSON.stringify(obj);
  for (const p of players.values()) {
    if (p.id === excludeId) continue;
    if (p.worldId !== worldId || p.levelNum !== levelNum) continue;
    try {
      if (p.ws && p.ws.readyState === 1) p.ws.send(payload);
    } catch {
      // ignore
    }
  }
}

function publicProfile(p) {
  return {
    id: p.id,
    name: p.name,
    tag: p.tag,
    worldId: p.worldId,
    levelNum: p.levelNum,
    x: p.x,
    y: p.y,
    z: p.z,
    yaw: p.yaw,
    anim: p.anim,
    weaponId: p.weaponId,
    weaponLvl: p.weaponLvl,
    armorLvl: p.armorLvl,
    avatar: p.avatar,
  };
}

function cleanStr(s, max = 20) {
  return String(s || '').replace(/[<>\r\n\t]/g, '').trim().slice(0, max);
}

onShutdown(async ({ drained }) => {
  for (const s of getWebSockets()) {
    try { s.close(1012, 'Server restarting — auto-reconnecting'); } catch {}
  }
  await drained;
});

export default async function handler(req) {
  const url = new URL(req.url);

  if (url.pathname === '/api/mp/status') {
    const zones = {};
    for (const p of players.values()) {
      const k = `${p.worldId}:${p.levelNum}`;
      zones[k] = (zones[k] || 0) + 1;
    }
    return Response.json({
      ok: true,
      online: players.size,
      maxPlayers: MAX_PLAYERS,
      zones,
    });
  }

  if (url.pathname === '/ws' && req.headers.get('upgrade')?.toLowerCase() === 'websocket') {
    if (players.size >= MAX_PLAYERS) {
      return new Response('Server full', { status: 503 });
    }

    const { socket, response } = upgradeWebSocket(req, { idleTimeout: 30 });
    const id = 'p_' + (nextId++).toString(36) + '_' + Math.random().toString(36).slice(2, 6);

    const player = {
      id,
      ws: socket,
      name: 'Explorer',
      tag: '',
      worldId: 'haven',
      levelNum: 0,
      x: 0,
      y: 1.2,
      z: 16.5,
      yaw: Math.PI,
      anim: 'idle',
      weaponId: 'stone',
      weaponLvl: 1,
      armorLvl: 1,
      avatar: {},
      joined: false,
      lastChatAt: 0,
    };
    players.set(id, player);

    socket.onopen = () => {
      safeSend(socket, {
        type: 'welcome',
        id,
        online: players.size,
      });
    };

    socket.onmessage = (event) => {
      let msg;
      try {
        msg = JSON.parse(typeof event.data === 'string' ? event.data : '');
      } catch {
        return;
      }
      if (!msg || typeof msg !== 'object') return;

      if (msg.type === 'hello' || msg.type === 'zone') {
        const prevWorld = player.worldId;
        const prevLevel = player.levelNum;
        const wasJoined = player.joined;

        if (msg.name) player.name = cleanStr(msg.name, 16) || 'Explorer';
        player.tag = cleanStr(msg.tag || '', 5);
        player.worldId = cleanStr(msg.worldId || 'haven', 16) || 'haven';
        player.levelNum = Number.isFinite(msg.levelNum) ? Math.max(0, Math.min(400, Math.floor(msg.levelNum))) : 0;
        if (Number.isFinite(msg.x)) player.x = msg.x;
        if (Number.isFinite(msg.y)) player.y = msg.y;
        if (Number.isFinite(msg.z)) player.z = msg.z;
        if (Number.isFinite(msg.yaw)) player.yaw = msg.yaw;
        if (msg.weaponId) player.weaponId = cleanStr(msg.weaponId, 24);
        if (Number.isFinite(msg.weaponLvl)) player.weaponLvl = Math.max(1, Math.min(6, Math.floor(msg.weaponLvl)));
        if (Number.isFinite(msg.armorLvl)) player.armorLvl = Math.max(1, Math.min(6, Math.floor(msg.armorLvl)));
        if (msg.avatar && typeof msg.avatar === 'object') player.avatar = msg.avatar;
        player.joined = true;

        // If switching zones, notify old zone that this player left
        if (wasJoined && (prevWorld !== player.worldId || prevLevel !== player.levelNum)) {
          broadcastZone(prevWorld, prevLevel, { type: 'leave', id, online: players.size }, id);
        }

        // Send snapshot of all players currently in the target zone to the joining player
        const peers = [];
        for (const other of players.values()) {
          if (other.id !== id && other.joined && other.worldId === player.worldId && other.levelNum === player.levelNum) {
            peers.push(publicProfile(other));
          }
        }
        safeSend(socket, { type: 'snapshot', peers, online: players.size });

        // Announce presence to everyone in this zone + update online count globally
        broadcastZone(player.worldId, player.levelNum, { type: 'join', player: publicProfile(player), online: players.size }, id);
        if (!wasJoined) {
          broadcastAll({ type: 'online', online: players.size, joinedName: player.name, joinedTag: player.tag }, id);
        }
        return;
      }

      if (msg.type === 'state' && player.joined) {
        if (Number.isFinite(msg.x)) player.x = msg.x;
        if (Number.isFinite(msg.y)) player.y = msg.y;
        if (Number.isFinite(msg.z)) player.z = msg.z;
        if (Number.isFinite(msg.yaw)) player.yaw = msg.yaw;
        if (typeof msg.anim === 'string') player.anim = msg.anim.slice(0, 10);
        broadcastZone(player.worldId, player.levelNum, {
          type: 'state',
          id,
          x: player.x,
          y: player.y,
          z: player.z,
          yaw: player.yaw,
          anim: player.anim,
        }, id);
        return;
      }

      if (msg.type === 'gear' && player.joined) {
        if (msg.name) player.name = cleanStr(msg.name, 16) || player.name;
        player.tag = cleanStr(msg.tag || '', 5);
        if (msg.weaponId) player.weaponId = cleanStr(msg.weaponId, 24);
        if (Number.isFinite(msg.weaponLvl)) player.weaponLvl = Math.max(1, Math.min(6, Math.floor(msg.weaponLvl)));
        if (Number.isFinite(msg.armorLvl)) player.armorLvl = Math.max(1, Math.min(6, Math.floor(msg.armorLvl)));
        if (msg.avatar && typeof msg.avatar === 'object') player.avatar = msg.avatar;
        broadcastZone(player.worldId, player.levelNum, {
          type: 'gear',
          player: publicProfile(player),
        }, id);
        return;
      }

      if (msg.type === 'attack' && player.joined) {
        broadcastZone(player.worldId, player.levelNum, {
          type: 'attack',
          id,
          weaponId: player.weaponId,
          x: player.x,
          y: player.y,
          z: player.z,
          yaw: player.yaw,
        }, id);
        // Optional live PvP hit relay inside Duel Arena!
        if (player.worldId === 'arena' && msg.targetId && players.has(msg.targetId)) {
          const target = players.get(msg.targetId);
          if (target && target.worldId === 'arena' && target.levelNum === player.levelNum) {
            safeSend(target.ws, {
              type: 'pvp_hit',
              fromId: id,
              fromName: player.name,
              dmg: 1,
              kx: Number.isFinite(msg.kx) ? msg.kx : 0,
              kz: Number.isFinite(msg.kz) ? msg.kz : 0,
            });
          }
        }
        return;
      }

      if (msg.type === 'chat' && player.joined) {
        const now = Date.now();
        if (now - player.lastChatAt < 450) return; // gentle anti-spam
        player.lastChatAt = now;
        const text = cleanStr(msg.text, 140);
        if (!text) return;
        const ch = msg.ch === 'guild' ? 'guild' : 'all';
        const out = {
          type: 'chat',
          ch,
          senderId: id,
          sender: player.name,
          tag: player.tag,
          text,
        };
        if (ch === 'guild' && player.tag) {
          const payload = JSON.stringify(out);
          for (const other of players.values()) {
            if (other.id !== id && other.tag === player.tag) {
              try { if (other.ws.readyState === 1) other.ws.send(payload); } catch {}
            }
          }
        } else {
          broadcastAll(out, id);
        }
      }
    };

    const cleanup = () => {
      if (!players.has(id)) return;
      const wasJoined = player.joined;
      players.delete(id);
      if (wasJoined) {
        broadcastZone(player.worldId, player.levelNum, { type: 'leave', id, online: players.size }, id);
        broadcastAll({ type: 'online', online: players.size, leftName: player.name }, id);
      }
    };

    socket.onclose = cleanup;
    socket.onerror = cleanup;
    return response;
  }

  return new Response('Skybound Relics Multiplayer Server Ready (Connect via WebSocket /ws)', { status: 200 });
}
