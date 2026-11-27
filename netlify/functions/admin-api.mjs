import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

const PLAYER_ID_RE = /^SKY-[A-Z0-9]{4,8}$/;
const CODE_RE = /^SKY-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function jsonRes(body, status = 200) {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a || ""), "utf8");
  const bufB = Buffer.from(String(b || ""), "utf8");
  if (bufA.length !== bufB.length || bufA.length === 0) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function randomCodePart(len = 4) {
  const bytes = crypto.randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) {
    out += CODE_CHARS[bytes[i] % CODE_CHARS.length];
  }
  return out;
}

function getGameStore(context) {
  const isProd = context?.deploy?.context === "production";
  const name = isProd ? "skybound-relics-prod" : "skybound-relics-preview";
  return { store: getStore({ name, consistency: "strong" }), deployContext: isProd ? "production" : (context?.deploy?.context || "preview") };
}

export default async (req, context) => {
  if (req.method !== "POST") {
    return jsonRes({ ok: false, error: "Method not allowed" }, 405);
  }

  const configuredSecret = Netlify.env.get("ADMIN_SECRET");
  if (!configuredSecret || configuredSecret.trim().length < 6) {
    return jsonRes({
      ok: false,
      code: "NO_SECRET",
      error: "ADMIN_SECRET is not set yet. Add ADMIN_SECRET (at least 6 characters) in Netlify -> Site configuration -> Environment variables, then redeploy.",
    }, 503);
  }

  const provided = req.headers.get("x-admin-secret") || "";
  if (!safeEqual(provided, configuredSecret)) {
    return jsonRes({ ok: false, error: "Invalid Admin Password" }, 401);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonRes({ ok: false, error: "Invalid JSON body" }, 400);
  }

  const action = String(body?.action || "");
  const { store, deployContext } = getGameStore(context);

  try {
    if (action === "verify") {
      return jsonRes({ ok: true, deployContext });
    }

    if (action === "list_all") {
      const [pList, gList, cList] = await Promise.all([
        store.list({ prefix: "players/" }),
        store.list({ prefix: "gifts/" }),
        store.list({ prefix: "codes/" }),
      ]);

      const players = [];
      for (const b of (pList.blobs || []).slice(0, 300)) {
        const p = await store.get(b.key, { type: "json", consistency: "strong" });
        if (p && p.playerId) players.push(p);
      }
      players.sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));

      const pendingGifts = [];
      for (const b of (gList.blobs || []).slice(0, 200)) {
        const g = await store.get(b.key, { type: "json", consistency: "strong" });
        if (g) pendingGifts.push(g);
      }
      pendingGifts.sort((a, b) => (b.sentAt || 0) - (a.sentAt || 0));

      const codes = [];
      for (const b of (cList.blobs || []).slice(0, 200)) {
        const c = await store.get(b.key, { type: "json", consistency: "strong" });
        if (c) codes.push(c);
      }
      codes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      return jsonRes({ ok: true, deployContext, players, pendingGifts, codes });
    }

    if (action === "send_coins") {
      const playerId = String(body?.playerId || "").trim().toUpperCase();
      const amount = Math.floor(Number(body?.amount) || 0);
      const note = String(body?.note || "Owner Gift").trim().slice(0, 80);

      if (!PLAYER_ID_RE.test(playerId)) {
        return jsonRes({ ok: false, error: "Invalid Player ID (expected SKY-XXXXXX)" }, 400);
      }
      if (amount < 1 || amount > 1000000) {
        return jsonRes({ ok: false, error: "Coin amount must be between 1 and 1,000,000" }, 400);
      }

      const giftId = `${Date.now()}-${randomCodePart(4)}`;
      const gift = { id: giftId, playerId, amount, note, sentAt: Date.now() };
      await store.setJSON(`gifts/${playerId}/${giftId}`, gift, { onlyIfNew: true });
      return jsonRes({ ok: true, gift });
    }

    if (action === "create_code") {
      const amount = Math.floor(Number(body?.amount) || 0);
      const note = String(body?.note || "Owner Gift Code").trim().slice(0, 80);
      if (amount < 1 || amount > 1000000) {
        return jsonRes({ ok: false, error: "Coin amount must be between 1 and 1,000,000" }, 400);
      }

      const code = `SKY-${randomCodePart(4)}-${randomCodePart(4)}`;
      const entry = {
        code,
        amount,
        note,
        used: false,
        usedBy: null,
        usedByName: null,
        usedAt: null,
        createdAt: Date.now(),
      };
      const res = await store.setJSON(`codes/${code}`, entry, { onlyIfNew: true });
      if (!res?.modified) {
        return jsonRes({ ok: false, error: "Code collision, please try again" }, 409);
      }
      return jsonRes({ ok: true, codeEntry: entry });
    }

    if (action === "delete_code") {
      const code = String(body?.code || "").trim().toUpperCase();
      if (!CODE_RE.test(code)) {
        return jsonRes({ ok: false, error: "Invalid code" }, 400);
      }
      await store.delete(`codes/${code}`);
      return jsonRes({ ok: true, deleted: code });
    }

    if (action === "toggle_owner") {
      const playerId = String(body?.playerId || "").trim().toUpperCase();
      if (!PLAYER_ID_RE.test(playerId)) {
        return jsonRes({ ok: false, error: "Invalid Player ID" }, 400);
      }
      const key = `players/${playerId}`;
      const existing = await store.get(key, { type: "json", consistency: "strong" });
      if (!existing) {
        return jsonRes({ ok: false, error: "Player has not synced yet" }, 404);
      }
      existing.isOwner = !existing.isOwner;
      await store.setJSON(key, existing);
      return jsonRes({ ok: true, player: existing });
    }

    if (action === "toggle_ban") {
      const playerId = String(body?.playerId || "").trim().toUpperCase();
      if (!PLAYER_ID_RE.test(playerId)) {
        return jsonRes({ ok: false, error: "Invalid Player ID" }, 400);
      }
      const key = `players/${playerId}`;
      const existing = await store.get(key, { type: "json", consistency: "strong" });
      if (!existing) {
        return jsonRes({ ok: false, error: "Player not found" }, 404);
      }
      existing.banned = !existing.banned;
      existing.banReason = existing.banned
        ? String(body?.reason || "Suspended by Owner").trim().slice(0, 100)
        : "";
      await store.setJSON(key, existing);
      return jsonRes({ ok: true, player: existing });
    }

    if (action === "delete_player") {
      const playerId = String(body?.playerId || "").trim().toUpperCase();
      if (!PLAYER_ID_RE.test(playerId)) {
        return jsonRes({ ok: false, error: "Invalid Player ID" }, 400);
      }
      await store.delete(`players/${playerId}`);
      const { blobs } = await store.list({ prefix: `gifts/${playerId}/` });
      for (const b of blobs || []) {
        await store.delete(b.key);
      }
      return jsonRes({ ok: true, deleted: playerId });
    }

    return jsonRes({ ok: false, error: "Unknown admin action" }, 400);
  } catch (err) {
    console.error("admin-api error:", err);
    return jsonRes({ ok: false, error: "Admin server error" }, 500);
  }
};

export const config = {
  path: "/api/admin",
  method: ["POST"],
};
