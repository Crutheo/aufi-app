import { Hono } from "hono";
import { randomUUID } from "crypto";
import type { Outfit, CreateOutfitRequest, UpdateOutfitRequest } from "@aufi/shared";
import { authMiddleware, type AuthEnv } from "../middleware/auth.js";
import { outfitsCollection } from "../lib/firestore.js";

export const outfitRoutes = new Hono<AuthEnv>();

outfitRoutes.use("*", authMiddleware);

// Create a new outfit
outfitRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json<CreateOutfitRequest>();

  const outfit: Outfit = {
    id: randomUUID(),
    userId,
    name: body.name,
    tags: body.tags,
    itemIds: body.itemIds,
    createdAt: new Date().toISOString(),
  };

  await outfitsCollection.doc(outfit.id).set(outfit);
  return c.json(outfit, 201);
});

// List outfits, optionally filtered by tag
outfitRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const tag = c.req.query("tag");

  let query = outfitsCollection.where("userId", "==", userId);
  if (tag) {
    query = query.where("tags", "array-contains", tag);
  }

  const snapshot = await query.orderBy("createdAt", "desc").get();
  const outfits = snapshot.docs.map((doc) => doc.data() as Outfit);
  return c.json(outfits);
});

// Get a random outfit by tag (must be before /:id)
outfitRoutes.get("/random", async (c) => {
  const userId = c.get("userId");
  const tag = c.req.query("tag");

  let query = outfitsCollection.where("userId", "==", userId);
  if (tag) {
    query = query.where("tags", "array-contains", tag);
  }

  const snapshot = await query.get();
  if (snapshot.empty) {
    return c.json({ error: "No outfits found" }, 404);
  }

  const randomIndex = Math.floor(Math.random() * snapshot.size);
  const outfit = snapshot.docs[randomIndex].data() as Outfit;
  return c.json(outfit);
});

// Get a single outfit by id
outfitRoutes.get("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const doc = await outfitsCollection.doc(id).get();
  if (!doc.exists) return c.json({ error: "Not found" }, 404);

  const outfit = doc.data() as Outfit;
  if (outfit.userId !== userId) return c.json({ error: "Forbidden" }, 403);

  return c.json(outfit);
});

// Update an outfit
outfitRoutes.put("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const body = await c.req.json<UpdateOutfitRequest>();

  const doc = await outfitsCollection.doc(id).get();
  if (!doc.exists) return c.json({ error: "Not found" }, 404);

  const existing = doc.data() as Outfit;
  if (existing.userId !== userId) return c.json({ error: "Forbidden" }, 403);

  const updates: Partial<Outfit> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.tags !== undefined) updates.tags = body.tags;
  if (body.itemIds !== undefined) updates.itemIds = body.itemIds;

  await outfitsCollection.doc(id).update(updates);
  return c.json({ ...existing, ...updates });
});

// Delete an outfit
outfitRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const doc = await outfitsCollection.doc(id).get();
  if (!doc.exists) return c.json({ error: "Not found" }, 404);

  const outfit = doc.data() as Outfit;
  if (outfit.userId !== userId) return c.json({ error: "Forbidden" }, 403);

  await outfitsCollection.doc(id).delete();
  return c.json({ success: true });
});
