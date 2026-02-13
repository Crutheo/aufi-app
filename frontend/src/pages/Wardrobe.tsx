import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ClothingItem } from "@aufi/shared";
import { api } from "../api/client";
import { ItemCard } from "../components/ItemCard";

export function Wardrobe() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ClothingItem[]>("/items")
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    await api.delete(`/items/${id}`);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  if (loading) return <p className="text-center text-gray-400">Loading...</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">My Wardrobe</h2>
        <Link
          to="/items/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white active:bg-gray-700"
        >
          + Add Item
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-16 text-center text-gray-400">
          <p className="text-4xl">👕</p>
          <p className="mt-2">No items yet. Add your first clothing item!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
