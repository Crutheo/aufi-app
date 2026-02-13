import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ClothingItem, Outfit } from "@aufi/shared";
import { api } from "../api/client";
import { ItemCard } from "../components/ItemCard";

export function CreateOutfit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<ClothingItem[]>("/items").then(setItems).catch(console.error);

    if (id) {
      api
        .get<Outfit>(`/outfits/${id}`)
        .then((outfit) => {
          // The list endpoint doesn't have a single-get, so for edit
          // we'll pre-populate from the outfits list in a future iteration.
          // For now the edit route loads the outfit data if the API supports it.
          setName(outfit.name);
          setTags(outfit.tags);
          setSelectedIds(new Set(outfit.itemIds));
        })
        .catch(console.error);
    }
  }, [id]);

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const toggleItem = (itemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || selectedIds.size === 0) return;

    setSaving(true);
    try {
      const payload = { name, tags, itemIds: [...selectedIds] };
      if (id) {
        await api.put(`/outfits/${id}`, payload);
      } else {
        await api.post("/outfits", payload);
      }
      navigate("/outfits");
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-900">
        {id ? "Edit Outfit" : "Create Outfit"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Outfit Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Smart Casual Friday"
            required
            className="w-full rounded-lg border px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Tags
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="e.g. casual"
              className="flex-1 rounded-lg border px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              type="button"
              onClick={addTag}
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 active:bg-gray-300"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Select Items ({selectedIds.size} selected)
          </label>
          {items.length === 0 ? (
            <p className="text-sm text-gray-400">
              No items in your wardrobe yet.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  selected={selectedIds.has(item.id)}
                  onSelect={() => toggleItem(item.id)}
                />
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving || !name || selectedIds.size === 0}
          className="w-full rounded-lg bg-gray-900 py-3 text-white disabled:opacity-50 active:bg-gray-700"
        >
          {saving ? "Saving..." : id ? "Update Outfit" : "Create Outfit"}
        </button>
      </form>
    </div>
  );
}
