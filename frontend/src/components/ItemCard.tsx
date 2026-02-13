import type { ClothingItem } from "@aufi/shared";

interface ItemCardProps {
  item: ClothingItem;
  selected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
}

export function ItemCard({ item, selected, onSelect, onDelete }: ItemCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`relative overflow-hidden rounded-lg border bg-white ${
        selected ? "ring-2 ring-gray-900" : ""
      } ${onSelect ? "cursor-pointer" : ""}`}
    >
      <img
        src={item.imageUrl}
        alt={item.name}
        className="aspect-square w-full object-cover"
      />
      <div className="p-2">
        <p className="truncate text-sm font-medium text-gray-900">
          {item.name}
        </p>
        <p className="text-xs capitalize text-gray-500">{item.category}</p>
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-1 top-1 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white"
        >
          X
        </button>
      )}
    </div>
  );
}
