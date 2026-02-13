import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES, type CreateItemResponse } from "@aufi/shared";
import { api } from "../api/client";
import { ImageCapture } from "../components/ImageCapture";
import { useBgRemoval } from "../components/BgRemovalProvider";

export function AddItem() {
  const navigate = useNavigate();
  const { queue: queueBgRemoval } = useBgRemoval();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name) return;

    setSaving(true);
    try {
      const { item, uploadUrl } = await api.post<CreateItemResponse>("/items", {
        name,
        category,
        contentType: file.type,
      });

      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      // Queue background removal to run after navigation
      queueBgRemoval(item.id, file);
      navigate("/");
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">Add Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ImageCapture onCapture={setFile} />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Blue Oxford Shirt"
            required
            className="w-full rounded-lg border px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-gray-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className="w-full rounded-lg border px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-gray-100"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={saving || !file || !name}
          className="w-full rounded-lg bg-gray-900 py-3 text-white disabled:opacity-50 active:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:active:bg-gray-300"
        >
          {saving ? "Saving..." : "Save Item"}
        </button>
      </form>
    </div>
  );
}
