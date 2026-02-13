import { useEffect, useState } from "react";
import type { ClothingItem, Outfit } from "@aufi/shared";
import { api } from "../api/client";
import { TagChip } from "../components/TagChip";
import { ItemCard } from "../components/ItemCard";

export function Suggest() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<Outfit | null>(null);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfitItems, setOutfitItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Outfit[]>("/outfits"),
      api.get<ClothingItem[]>("/items"),
    ])
      .then(([o, i]) => {
        setOutfits(o);
        setItems(i);
        setAllTags([...new Set(o.flatMap((outfit) => outfit.tags))].sort());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const suggest = (tag: string | null) => {
    setSelectedTag(tag);

    const pool = tag
      ? outfits.filter((o) => o.tags.includes(tag))
      : outfits;

    if (pool.length === 0) {
      setSuggestion(null);
      setOutfitItems([]);
      return;
    }

    const pick = pool[Math.floor(Math.random() * pool.length)];
    setSuggestion(pick);
    setOutfitItems(items.filter((i) => pick.itemIds.includes(i.id)));
  };

  if (loading) return <p className="text-center text-gray-400">Loading...</p>;

  if (outfits.length === 0) {
    return (
      <div className="mt-16 text-center text-gray-400">
        <p className="text-4xl">✨</p>
        <p className="mt-2">Create some outfits first, then come back for suggestions!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-900">
        What's the vibe?
      </h2>

      <div className="mb-6 flex flex-wrap gap-2">
        <TagChip
          tag="Any"
          active={selectedTag === null && suggestion !== null}
          onClick={() => suggest(null)}
        />
        {allTags.map((tag) => (
          <TagChip
            key={tag}
            tag={tag}
            active={selectedTag === tag}
            onClick={() => suggest(tag)}
          />
        ))}
      </div>

      {suggestion ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {suggestion.name}
            </h3>
            <button
              onClick={() => suggest(selectedTag)}
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 active:bg-gray-300"
            >
              Shuffle
            </button>
          </div>

          {outfitItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {outfitItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Items not loaded — check your wardrobe.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-8 text-center text-gray-400">
          <p>Pick a vibe above to get an outfit suggestion</p>
        </div>
      )}
    </div>
  );
}
