import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES, type Category, type ClothingItem, type ItemWearStats } from "@aufi/shared";
import { api } from "../api/client";
import { ItemCard } from "../components/ItemCard";
import { TagChip } from "../components/TagChip";
import { useBgRemoval } from "../components/BgRemovalProvider";

type SortOption = "recent" | "last_worn" | "most_worn";

const SORT_LABELS: Record<SortOption, string> = {
  recent: "Recently added",
  last_worn: "Last worn",
  most_worn: "Most worn",
};

export function Wardrobe() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [itemStatsMap, setItemStatsMap] = useState<Map<string, ItemWearStats>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [sort, setSort] = useState<SortOption>("recent");
  const { completedCount } = useBgRemoval();

  useEffect(() => {
    Promise.all([
      api.get<ClothingItem[]>("/items"),
      api.get<{ itemStats: ItemWearStats[] }>("/wear/stats"),
    ])
      .then(([i, { itemStats }]) => {
        setItems(i);
        setItemStatsMap(new Map(itemStats.map((s) => [s.itemId, s])));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [completedCount]);

  const handleDelete = async (id: string) => {
    await api.delete(`/items/${id}`);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const filteredItems = (
    activeCategory ? items.filter((i) => i.category === activeCategory) : [...items]
  ).sort((a, b) => {
    if (sort === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    const statsA = itemStatsMap.get(a.id);
    const statsB = itemStatsMap.get(b.id);
    if (sort === "most_worn") {
      return (statsB?.totalWears ?? 0) - (statsA?.totalWears ?? 0);
    }
    // last_worn: most recently worn first, never-worn items last
    const lastA = statsA?.lastWornAt ? new Date(statsA.lastWornAt).getTime() : 0;
    const lastB = statsB?.lastWornAt ? new Date(statsB.lastWornAt).getTime() : 0;
    return lastB - lastA;
  });

  if (loading) return <p className="text-center text-gray-400">Loading...</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Wardrobe</h2>
        <Link
          to="/items/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white active:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:active:bg-gray-300"
        >
          + Add Item
        </Link>
      </div>

      {items.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <TagChip
            tag="All"
            active={activeCategory === null}
            onClick={() => setActiveCategory(null)}
          />
          {CATEGORIES.map((cat) => (
            <TagChip
              key={cat}
              tag={cat.charAt(0).toUpperCase() + cat.slice(1)}
              active={activeCategory === cat}
              onClick={() =>
                setActiveCategory(cat === activeCategory ? null : cat)
              }
            />
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Sort:</span>
          {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  sort === key
                    ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className="mt-16 text-center text-gray-400">
          <p className="text-4xl">👕</p>
          <p className="mt-2">No items yet. Add your first clothing item!</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="mt-16 text-center text-gray-400">
          <p className="mt-2">No items in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              wearStats={itemStatsMap.get(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
