import { getStorage } from "firebase-admin/storage";

const BUCKET_NAME = process.env.GCS_BUCKET || "";

export function getBucket() {
  return getStorage().bucket(BUCKET_NAME);
}

export async function generateUploadUrl(
  filePath: string,
  contentType: string
): Promise<string> {
  const bucket = getBucket();
  const file = bucket.file(filePath);
  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
  });
  return url;
}

export async function generateReadUrl(filePath: string): Promise<string> {
  const bucket = getBucket();
  const file = bucket.file(filePath);
  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return url;
}

export async function deleteFile(filePath: string): Promise<void> {
  const bucket = getBucket();
  await bucket.file(filePath).delete({ ignoreNotFound: true });
}
