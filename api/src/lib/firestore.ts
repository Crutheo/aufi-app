import { readFileSync } from "fs";
import { resolve } from "path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath) {
    const abs = resolve(keyPath);
    const serviceAccount = JSON.parse(readFileSync(abs, "utf-8"));
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    // On Cloud Run, default credentials are available automatically.
    initializeApp();
  }
}

export const db = getFirestore();
export const itemsCollection = db.collection("items");
export const outfitsCollection = db.collection("outfits");
export const wearsCollection = db.collection("wears");
