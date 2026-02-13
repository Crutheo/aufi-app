import { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "../api/client";

interface BgRemovalContext {
  queue: (itemId: string, file: File) => void;
  pending: number;
  completedCount: number;
}

const Ctx = createContext<BgRemovalContext>({
  queue: () => {},
  pending: 0,
  completedCount: 0,
});

export function useBgRemoval() {
  return useContext(Ctx);
}

interface Job {
  itemId: string;
  file: File;
}

export function BgRemovalProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const jobs = useRef<Job[]>([]);
  const processing = useRef(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../workers/bg-removal.worker.ts", import.meta.url),
      { type: "module" }
    );
    return () => workerRef.current?.terminate();
  }, []);

  const processNext = useCallback(async () => {
    if (processing.current || jobs.current.length === 0 || !workerRef.current)
      return;
    processing.current = true;

    const job = jobs.current.shift()!;
    const worker = workerRef.current;

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        const handler = (e: MessageEvent) => {
          worker.removeEventListener("message", handler);
          if (e.data.success) resolve(e.data.blob);
          else reject(new Error(e.data.error));
        };
        worker.addEventListener("message", handler);
        worker.postMessage({ file: job.file });
      });

      const { uploadUrl } = await api.post<{ uploadUrl: string }>(
        `/items/${job.itemId}/reupload`,
        { contentType: "image/png" }
      );

      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "image/png" },
        body: blob,
      });

      setCompletedCount((c) => c + 1);
    } catch (err) {
      console.error("Background removal failed for item", job.itemId, err);
    }

    setPending((p) => p - 1);
    processing.current = false;
    processNext();
  }, []);

  const queue = useCallback(
    (itemId: string, file: File) => {
      jobs.current.push({ itemId, file });
      setPending((p) => p + 1);
      processNext();
    },
    [processNext]
  );

  return (
    <Ctx.Provider value={{ queue, pending, completedCount }}>
      {children}
    </Ctx.Provider>
  );
}
