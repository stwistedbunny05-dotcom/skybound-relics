import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

const PLAYER_ID_RE = /^SKY-[A-Z0-9]{4,8}$/;
const CODE_RE = /^SKY-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const RARE_BOSS_WEAPONS = ["kunai", "venom_dagger", "storm_bow", "dragon_lance", "sunblade", "titan_axe"];

function rollLuckyDrop() {
  const r = crypto.randomBytes(4);
  const weaponId = RARE_BOSS_WEAPONS[r[0] % RARE_BOSS_WEAPONS.length];
  const roll = r[1] % 100;
  const weaponLevel = roll < 7 ? 6 : roll < 25 ? 5 : roll < 55 ? 4 : 3;
  const bonusCoins = [250, 400, 600, 850, 1200, 1500][r[2] % 6];
  return { weaponId, weaponLevel, bonusCoins };
}

function jsonRes(body, status = 200) {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function getGameStore(context) {
  const isProd = context?.deploy?.context === "production";
  const name = isProd ? "skybound-relics-prod" : "skybound-relics-preview";
  return getStore({ name, consistency: "strong" });
}

export default async (req, context) => {
  if (req.method !== "POST") {
    return jsonRes({ ok: false, error: "Method not allowed" }, 405);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonRes({ ok: false, error: "Invalid JSON body" }, 400);
  }

  const action = String(body?.action || "");
  const store = getGameStore(context);

  // Cross-Device Account Linking by Game Account ID (SKY-XXXXXX) OR Hero Name!
  if (action === "link_account") {
    try {
      const rawQuery = String(body?.query || "").trim();
      if (rawQuery.length < 3) {
        return jsonRes({ ok: false, error: "Enter your Hero Name or Game Account ID (e.g. SKY-XXXXXX)." }, 400);
      }
      const upperQ = rawQuery.toUpperCase();
      let found = null;
      if (PLAYER_ID_RE.test(upperQ)) {
        found = await store.get(`players/${upperQ}`, { type: "json", consistency: "strong" });
      } else {
        const { blobs } = await store.list({ prefix: "players/" });
        const lowerQ = rawQuery.toLowerCase();
        for (const b of (blobs || []).slice(0, 500)) {
          const p = await store.get(b.key, { type: "json", consistency: "strong" });
          if (p && String(p.name || "").trim().toLowerCase() === lowerQ) {
            found = p;
            break;
          }
        }
      }
      if (!found) {
        return jsonRes({ ok: false, error: `No synced account found matching "${rawQuery}". Make sure your other device played online at least once!` }, 404);
      }
      if (found.banned) {
        return jsonRes({ ok: false, error: `Account ${found.playerId} is suspended: ${found.banReason || "Suspended by Owner"}` }, 403);
      }
      return jsonRes({
        ok: true,
        playerId: found.playerId,
        name: found.name,
        isOwner: Boolean(found.isOwner),
        cloudSave: found.cloudSave || null,
      });
    } catch (err) {
      console.error("link_account error:", err);
      return jsonRes({ ok: false, error: "Server lookup error" }, 500);
    }
  }

  const playerId = String(body?.playerId || "").trim().toUpperCase();
  if (!PLAYER_ID_RE.test(playerId)) {
    return jsonRes({ ok: false, error: "Invalid Player ID" }, 400);
  }

  try {
    if (action === "sync") {
      const playerKey = `players/${playerId}`;
      const existing = await store.get(playerKey, { type: "json", consistency: "strong" });

      const profile = {
        playerId,
        name: String(body?.name || existing?.name || "Explorer").trim().slice(0, 18),
        world: String(body?.world || existing?.world || "haven").slice(0, 20),
        level: Math.max(0, Math.min(400, Number(body?.level) || 0)),
        credits: Math.max(0, Math.min(99999999, Number(body?.credits) || 0)),
        bagCount: Math.max(0, Math.min(15, Number(body?.bagCount) || 1)),
        totalKills: Math.max(0, Number(body?.totalKills) || 0),
        guildName: body?.guildName ? String(body.guildName).slice(0, 24) : null,
        isOwner: Boolean(existing?.isOwner),
        banned: Boolean(existing?.banned),
        banReason: existing?.banReason ? String(existing.banReason).slice(0, 100) : "",
        cloudSave: (body?.cloudSave && typeof body.cloudSave === "object") ? body.cloudSave : (existing?.cloudSave || null),
        firstSeen: existing?.firstSeen || Date.now(),
        lastSeen: Date.now(),
      };
      await store.setJSON(playerKey, profile);

      if (profile.banned) {
        return jsonRes({
          ok: true,
          banned: true,
          banReason: profile.banReason || "Suspended by Owner",
          isOwner: false,
          claimedGifts: [],
          totalGiftCredits: 0,
        });
      }

      // Claim any pending Owner Coin, Rare Weapon, Lucky Drop, Arrow & Armor Gifts!
      const giftPrefix = `gifts/${playerId}/`;
      const { blobs } = await store.list({ prefix: giftPrefix });
      const claimedGifts = [];
      let totalGiftCredits = 0;

      for (const b of blobs || []) {
        const g = await store.get(b.key, { type: "json", consistency: "strong" });
        await store.delete(b.key);
        if (!g) continue;
        const kind = String(g.kind || "coins");
        const amt = Math.max(0, Math.floor(Number(g.amount) || 0));
        if (amt > 0) totalGiftCredits += amt;
        if (amt > 0 || kind !== "coins") {
          claimedGifts.push({
            id: g.id || b.key,
            kind,
            amount: amt,
            weaponId: g.weaponId || null,
            weaponLevel: g.weaponLevel || null,
            arrowId: g.arrowId || null,
            armorLevel: g.armorLevel || null,
            heartsLevel: g.heartsLevel || null,
            statBoost: g.statBoost || null,
            abilityLevel: g.abilityLevel || null,
            diffTier: g.diffTier || null,
            rankBoost: g.rankBoost || null,
            worldAccess: g.worldAccess || null,
            note: String(g.note || "Owner Gift").slice(0, 80),
            sentAt: g.sentAt || Date.now(),
          });
        }
      }

      return jsonRes({
        ok: true,
        isOwner: profile.isOwner,
        claimedGifts,
        totalGiftCredits,
      });
    }

    if (action === "redeem") {
      const pCheck = await store.get(`players/${playerId}`, { type: "json", consistency: "strong" });
      if (pCheck?.banned) {
        return jsonRes({ ok: false, error: "This account is suspended and cannot redeem codes." }, 403);
      }
      const code = String(body?.code || "").trim().toUpperCase();
      if (!CODE_RE.test(code)) {
        return jsonRes({ ok: false, error: "Invalid code format (expected SKY-XXXX-XXXX)" }, 400);
      }

      const codeKey = `codes/${code}`;
      const entry = await store.getWithMetadata(codeKey, { type: "json", consistency: "strong" });
      if (entry === null || !entry.data) {
        return jsonRes({ ok: false, error: "Gift code not found" }, 404);
      }
      if (entry.data.used) {
        return jsonRes({ ok: false, error: "This code has already been redeemed" }, 409);
      }

      let rewardWeaponId = entry.data.bonusKind === "weapon" ? entry.data.weaponId : null;
      let rewardWeaponLevel = entry.data.bonusKind === "weapon" ? (entry.data.weaponLevel || 4) : null;
      let totalAmount = Math.max(0, Math.floor(Number(entry.data.amount) || 0));
      let isLuckyDrop = entry.data.bonusKind === "lucky_drop";

      if (isLuckyDrop) {
        const rolled = rollLuckyDrop();
        rewardWeaponId = rolled.weaponId;
        rewardWeaponLevel = rolled.weaponLevel;
        totalAmount += rolled.bonusCoins;
      }

      const updated = {
        ...entry.data,
        used: true,
        usedBy: playerId,
        usedByName: String(body?.name || "Explorer").trim().slice(0, 18),
        usedAt: Date.now(),
        rolledWeaponId: rewardWeaponId,
        rolledWeaponLevel: rewardWeaponLevel,
      };
      const res = await store.setJSON(codeKey, updated, { onlyIfMatch: entry.etag });
      if (!res?.modified) {
        return jsonRes({ ok: false, error: "This code was just redeemed by someone else" }, 409);
      }

      return jsonRes({
        ok: true,
        code,
        amount: totalAmount,
        isLuckyDrop,
        weaponId: rewardWeaponId,
        weaponLevel: rewardWeaponLevel,
        note: String(entry.data.note || "Gift Code").slice(0, 80),
      });
    }

    return jsonRes({ ok: false, error: "Unknown action" }, 400);
  } catch (err) {
    console.error("player-sync error:", err);
    return jsonRes({ ok: false, error: "Server storage error" }, 500);
  }
};

export const config = {
  path: "/api/player",
  method: ["POST"],
};
