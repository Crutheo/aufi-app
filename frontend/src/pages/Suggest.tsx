import { useEffect, useState } from "react";
import type { ClothingItem, Outfit, WearEvent } from "@aufi/shared";
import { api } from "../api/client";
import { TagChip } from "../components/TagChip";
import { ItemCard } from "../components/ItemCard";

export function Suggest() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [suggestion, setSuggestion] = useState<Outfit | null>(null);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfitItems, setOutfitItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [worn, setWorn] = useState(false);

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

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
    setSuggestion(null);
    setOutfitItems([]);
    setWorn(false);
  };

  const suggest = () => {
    const pool =
      selectedTags.size > 0
        ? outfits.filter((o) =>
            [...selectedTags].every((tag) => o.tags.includes(tag))
          )
        : outfits;

    if (pool.length === 0) {
      setSuggestion(null);
      setOutfitItems([]);
      return;
    }

    const pick = pool[Math.floor(Math.random() * pool.length)];
    setSuggestion(pick);
    setOutfitItems(items.filter((i) => pick.itemIds.includes(i.id)));
    setWorn(false);
  };

  const handleWear = async () => {
    if (!suggestion) return;
    await api.post<WearEvent>("/wear", { outfitId: suggestion.id });
    setWorn(true);
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

      <div className="mb-4 flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <TagChip
            key={tag}
            tag={tag}
            active={selectedTags.has(tag)}
            onClick={() => toggleTag(tag)}
          />
        ))}
      </div>

      <button
        onClick={suggest}
        className="mb-6 w-full rounded-lg bg-gray-900 py-3 text-white active:bg-gray-700"
      >
        {suggestion ? "Shuffle" : selectedTags.size > 0 ? "Suggest outfit" : "Surprise me"}
      </button>

      {suggestion ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {suggestion.name}
            </h3>
            <div className="flex flex-wrap gap-1">
              {suggestion.tags.map((tag) => (
                <TagChip key={tag} tag={tag} />
              ))}
            </div>
          </div>

          <button
            onClick={handleWear}
            disabled={worn}
            className={`mb-4 w-full rounded-lg py-3 text-sm font-medium ${
              worn
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-900 active:bg-gray-200"
            }`}
          >
            {worn ? "Logged as worn!" : "Wear it"}
          </button>

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
          <p>Select tags and hit suggest, or just hit surprise me</p>
        </div>
      )}
    </div>
  );
}
