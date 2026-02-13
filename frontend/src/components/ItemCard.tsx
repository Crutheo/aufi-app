import type { ClothingItem, ItemWearStats } from "@aufi/shared";
import { KebabMenu } from "./KebabMenu";

interface ItemCardProps {
  item: ClothingItem;
  wearStats?: ItemWearStats;
  selected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function ItemCard({ item, wearStats, selected, onSelect, onDelete }: ItemCardProps) {
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
      <div className="flex items-start justify-between p-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">
            {item.name}
          </p>
          <p className="text-xs capitalize text-gray-500">{item.category}</p>
          {wearStats && wearStats.totalWears > 0 && (
            <p className="text-xs text-gray-400">
              {wearStats.totalWears}x{" "}
              {wearStats.lastWornAt && `· ${timeAgo(wearStats.lastWornAt)}`}
            </p>
          )}
        </div>
        {onDelete && (
          <KebabMenu items={[{ label: "Delete", onClick: onDelete, destructive: true }]} />
        )}
      </div>
    </div>
  );
}
