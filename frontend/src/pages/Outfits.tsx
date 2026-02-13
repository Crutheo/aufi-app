import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Outfit } from "@aufi/shared";
import { api } from "../api/client";
import { OutfitCard } from "../components/OutfitCard";
import { TagChip } from "../components/TagChip";

export function Outfits() {
  const navigate = useNavigate();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    const query = activeTag ? `?tag=${encodeURIComponent(activeTag)}` : "";
    api
      .get<Outfit[]>(`/outfits${query}`)
      .then(setOutfits)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeTag]);

  const handleDelete = async (id: string) => {
    await api.delete(`/outfits/${id}`);
    setOutfits((prev) => prev.filter((o) => o.id !== id));
  };

  const allTags = [...new Set(outfits.flatMap((o) => o.tags))].sort();

  if (loading) return <p className="text-center text-gray-400">Loading...</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">My Outfits</h2>
        <Link
          to="/outfits/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white active:bg-gray-700"
        >
          + New Outfit
        </Link>
      </div>

      {allTags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <TagChip
            tag="All"
            active={activeTag === null}
            onClick={() => setActiveTag(null)}
          />
          {allTags.map((tag) => (
            <TagChip
              key={tag}
              tag={tag}
              active={activeTag === tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
            />
          ))}
        </div>
      )}

      {outfits.length === 0 ? (
        <div className="mt-16 text-center text-gray-400">
          <p className="text-4xl">👔</p>
          <p className="mt-2">No outfits yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {outfits.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              onDelete={() => handleDelete(outfit.id)}
              onClick={() => navigate(`/outfits/${outfit.id}/edit`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
