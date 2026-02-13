import { useEffect, useState } from "react";
import type { ClothingItem, WearEvent } from "@aufi/shared";
import { api } from "../api/client";
import { ItemCard } from "../components/ItemCard";

interface WearHistoryEntry extends WearEvent {
  outfitName: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function History() {
  const [entries, setEntries] = useState<WearHistoryEntry[]>([]);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<WearHistoryEntry[]>("/wear/history"),
      api.get<ClothingItem[]>("/items"),
    ])
      .then(([h, i]) => {
        setEntries(h);
        setItems(i);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center text-gray-400">Loading...</p>;

  if (entries.length === 0) {
    return (
      <div className="mt-16 text-center text-gray-400">
        <p className="text-4xl">📅</p>
        <p className="mt-2">No wear history yet. Start logging outfits!</p>
      </div>
    );
  }

  // Group entries by date
  const grouped = new Map<string, WearHistoryEntry[]>();
  for (const entry of entries) {
    const key = formatDate(entry.wornAt);
    const group = grouped.get(key);
    if (group) group.push(entry);
    else grouped.set(key, [entry]);
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">History</h2>

      <div className="space-y-6">
        {[...grouped.entries()].map(([date, dayEntries]) => (
          <div key={date}>
            <h3 className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
              {date}
            </h3>
            <div className="space-y-2">
              {dayEntries.map((entry) => {
                const isExpanded = expandedId === entry.id;
                const entryItems = items.filter((i) =>
                  entry.itemIds.includes(i.id)
                );

                return (
                  <div key={entry.id}>
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : entry.id)
                      }
                      className="w-full rounded-lg border bg-white p-3 text-left dark:border-gray-700 dark:bg-gray-900"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {entry.outfitName}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {entry.itemIds.length} item
                          {entry.itemIds.length !== 1 && "s"}
                          {" · "}
                          {new Date(entry.wornAt).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </button>
                    {isExpanded && entryItems.length > 0 && (
                      <div className="mt-2 grid grid-cols-3 gap-2 pl-2">
                        {entryItems.map((item) => (
                          <ItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
