import { Hono } from "hono";
import { randomUUID } from "crypto";
import type { WearEvent, WearStats, ItemWearStats } from "@aufi/shared";
import { authMiddleware, type AuthEnv } from "../middleware/auth.js";
import { wearsCollection, outfitsCollection } from "../lib/firestore.js";
import type { Outfit } from "@aufi/shared";

export const wearRoutes = new Hono<AuthEnv>();

wearRoutes.use("*", authMiddleware);

// Record wearing an outfit
wearRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  const { outfitId } = await c.req.json<{ outfitId: string }>();

  const outfitDoc = await outfitsCollection.doc(outfitId).get();
  if (!outfitDoc.exists) return c.json({ error: "Outfit not found" }, 404);

  const outfit = outfitDoc.data() as Outfit;
  if (outfit.userId !== userId) return c.json({ error: "Forbidden" }, 403);

  const wearEvent: WearEvent = {
    id: randomUUID(),
    userId,
    outfitId,
    itemIds: outfit.itemIds,
    wornAt: new Date().toISOString(),
  };

  await wearsCollection.doc(wearEvent.id).set(wearEvent);
  return c.json(wearEvent, 201);
});

// Get wear history (events with outfit names)
wearRoutes.get("/history", async (c) => {
  const userId = c.get("userId");

  const snapshot = await wearsCollection
    .where("userId", "==", userId)
    .orderBy("wornAt", "desc")
    .get();

  const events = snapshot.docs.map((doc) => doc.data() as WearEvent);

  // Fetch outfit names for all referenced outfits
  const outfitIds = [...new Set(events.map((e) => e.outfitId))];
  const outfitNames = new Map<string, string>();
  for (const id of outfitIds) {
    const doc = await outfitsCollection.doc(id).get();
    if (doc.exists) {
      outfitNames.set(id, (doc.data() as Outfit).name);
    }
  }

  const history = events.map((e) => ({
    ...e,
    outfitName: outfitNames.get(e.outfitId) ?? "Deleted outfit",
  }));

  return c.json(history);
});

// Get wear stats for all outfits
wearRoutes.get("/stats", async (c) => {
  const userId = c.get("userId");

  const snapshot = await wearsCollection
    .where("userId", "==", userId)
    .orderBy("wornAt", "desc")
    .get();

  const events = snapshot.docs.map((doc) => doc.data() as WearEvent);

  // Outfit stats
  const outfitMap = new Map<string, { lastWornAt: string; count: number }>();
  for (const e of events) {
    const existing = outfitMap.get(e.outfitId);
    if (!existing) {
      outfitMap.set(e.outfitId, { lastWornAt: e.wornAt, count: 1 });
    } else {
      existing.count++;
    }
  }

  const outfitStats: WearStats[] = [...outfitMap.entries()].map(
    ([outfitId, { lastWornAt, count }]) => ({
      outfitId,
      lastWornAt,
      totalWears: count,
    })
  );

  // Item stats
  const itemMap = new Map<string, { lastWornAt: string; count: number }>();
  for (const e of events) {
    for (const itemId of e.itemIds) {
      const existing = itemMap.get(itemId);
      if (!existing) {
        itemMap.set(itemId, { lastWornAt: e.wornAt, count: 1 });
      } else {
        existing.count++;
      }
    }
  }

  const itemStats: ItemWearStats[] = [...itemMap.entries()].map(
    ([itemId, { lastWornAt, count }]) => ({
      itemId,
      lastWornAt,
      totalWears: count,
    })
  );

  return c.json({ outfitStats, itemStats });
});
