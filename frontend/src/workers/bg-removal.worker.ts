import { removeBackground } from "@imgly/background-removal";

self.onmessage = async (e: MessageEvent<{ file: File }>) => {
  try {
    const blob = await removeBackground(e.data.file);
    self.postMessage({ success: true, blob });
  } catch (err) {
    self.postMessage({ success: false, error: String(err) });
  }
};
