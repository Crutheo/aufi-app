import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ClothingItem, Outfit } from "@aufi/shared";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthProvider";

interface DataContextValue {
  items: ClothingItem[];
  outfits: Outfit[];
  itemsLoading: boolean;
  outfitsLoading: boolean;
  refreshItems: () => Promise<void>;
  refreshOutfits: () => Promise<void>;
  addItem: (item: ClothingItem) => void;
  removeItem: (id: string) => void;
  addOutfit: (outfit: Outfit) => void;
  updateOutfit: (outfit: Outfit) => void;
  removeOutfit: (id: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [outfitsLoading, setOutfitsLoading] = useState(true);

  const refreshItems = useCallback(async () => {
    try {
      const data = await api.get<ClothingItem[]>("/items");
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setItemsLoading(false);
    }
  }, []);

  const refreshOutfits = useCallback(async () => {
    try {
      const data = await api.get<Outfit[]>("/outfits");
      setOutfits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setOutfitsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    refreshItems();
    refreshOutfits();
  }, [user, refreshItems, refreshOutfits]);

  const addItem = useCallback((item: ClothingItem) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const addOutfit = useCallback((outfit: Outfit) => {
    setOutfits((prev) => [outfit, ...prev]);
  }, []);

  const updateOutfit = useCallback((outfit: Outfit) => {
    setOutfits((prev) => prev.map((o) => (o.id === outfit.id ? outfit : o)));
  }, []);

  const removeOutfit = useCallback((id: string) => {
    setOutfits((prev) => prev.filter((o) => o.id !== id));
  }, []);

  return (
    <DataContext.Provider
      value={{
        items,
        outfits,
        itemsLoading,
        outfitsLoading,
        refreshItems,
        refreshOutfits,
        addItem,
        removeItem,
        addOutfit,
        updateOutfit,
        removeOutfit,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
