import type { Outfit } from "@aufi/shared";
import { TagChip } from "./TagChip";

interface OutfitCardProps {
  outfit: Outfit;
  onDelete?: () => void;
  onClick?: () => void;
}

export function OutfitCard({ outfit, onDelete, onClick }: OutfitCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border bg-white p-4 ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-medium text-gray-900">{outfit.name}</h3>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-sm text-red-500"
          >
            Delete
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-400">
        {outfit.itemIds.length} item{outfit.itemIds.length !== 1 && "s"}
      </p>
      {outfit.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {outfit.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}
