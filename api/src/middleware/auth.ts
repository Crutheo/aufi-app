import type { Context, Next } from "hono";
import { getAuth } from "firebase-admin/auth";

export interface AuthEnv {
  Variables: {
    userId: string;
  };
}

export async function authMiddleware(c: Context<AuthEnv>, next: Next) {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }

  const token = header.slice(7);
  try {
    const decoded = await getAuth().verifyIdToken(token);
    c.set("userId", decoded.uid);
    return next();
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
}
