import { Hono } from "hono";
import { randomUUID } from "crypto";
import type { ClothingItem, CreateItemRequest, CreateItemResponse } from "@aufi/shared";
import { authMiddleware, type AuthEnv } from "../middleware/auth.js";
import { itemsCollection } from "../lib/firestore.js";
import { generateUploadUrl, generateReadUrl, deleteFile } from "../lib/storage.js";

export const itemRoutes = new Hono<AuthEnv>();

itemRoutes.use("*", authMiddleware);

// Create a new clothing item
itemRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json<CreateItemRequest>();

  const id = randomUUID();
  const imagePath = `users/${userId}/items/${id}`;

  const item: ClothingItem = {
    id,
    userId,
    name: body.name,
    category: body.category,
    imageUrl: imagePath,
    createdAt: new Date().toISOString(),
  };

  await itemsCollection.doc(id).set(item);
  const uploadUrl = await generateUploadUrl(imagePath, body.contentType);

  const response: CreateItemResponse = { item, uploadUrl };
  return c.json(response, 201);
});

// List all items for the current user
itemRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const snapshot = await itemsCollection
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  const items: ClothingItem[] = [];
  for (const doc of snapshot.docs) {
    const item = doc.data() as ClothingItem;
    item.imageUrl = await generateReadUrl(item.imageUrl);
    items.push(item);
  }

  return c.json(items);
});

// Get a new signed upload URL for an existing item (used for bg removal reupload)
itemRoutes.post("/:id/reupload", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const body = await c.req.json<{ contentType: string }>();

  const doc = await itemsCollection.doc(id).get();
  if (!doc.exists) return c.json({ error: "Not found" }, 404);

  const item = doc.data() as ClothingItem;
  if (item.userId !== userId) return c.json({ error: "Forbidden" }, 403);

  const uploadUrl = await generateUploadUrl(item.imageUrl, body.contentType);
  return c.json({ uploadUrl });
});

// Delete an item
itemRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const doc = await itemsCollection.doc(id).get();
  if (!doc.exists) return c.json({ error: "Not found" }, 404);

  const item = doc.data() as ClothingItem;
  if (item.userId !== userId) return c.json({ error: "Forbidden" }, 403);

  await deleteFile(item.imageUrl);
  await itemsCollection.doc(id).delete();

  return c.json({ success: true });
});
