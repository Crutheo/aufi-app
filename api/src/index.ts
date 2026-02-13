import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { itemRoutes } from "./routes/items.js";
import { outfitRoutes } from "./routes/outfits.js";
import { wearRoutes } from "./routes/wear.js";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.get("/api/health", (c) => c.json({ status: "ok" }));

app.route("/api/items", itemRoutes);
app.route("/api/outfits", outfitRoutes);
app.route("/api/wear", wearRoutes);

const port = parseInt(process.env.PORT || "8080", 10);
console.log(`API server running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
