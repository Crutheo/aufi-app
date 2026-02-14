import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Outfit } from "@aufi/shared";
import { api } from "../api/client";
import { TagChip } from "../components/TagChip";
import { ItemCard } from "../components/ItemCard";
import { useData } from "../components/DataProvider";

export function OutfitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, itemsLoading } = useData();
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api
        .get<Outfit>(`/outfits/${id}`)
        .then(setOutfit)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading || itemsLoading)
    return <p className="text-center text-gray-400">Loading...</p>;

  if (!outfit) {
    return (
      <div className="mt-16 text-center text-gray-400">
        <p>Outfit not found.</p>
      </div>
    );
  }

  const outfitItems = items.filter((i) => outfit.itemIds.includes(i.id));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {outfit.name}
        </h2>
        <button
          onClick={() => navigate(`/outfits/${id}/edit`)}
          className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 active:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:active:bg-gray-600"
        >
          Edit
        </button>
      </div>

      {outfit.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1">
          {outfit.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>
      )}

      {outfitItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {outfitItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">
          No items found for this outfit.
        </p>
      )}
    </div>
  );
}
