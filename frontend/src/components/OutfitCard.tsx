import type { Outfit, WearStats } from "@aufi/shared";
import { TagChip } from "./TagChip";
import { KebabMenu } from "./KebabMenu";

interface OutfitCardProps {
  outfit: Outfit;
  wearStats?: WearStats;
  onDelete?: () => void;
  onWear?: () => void;
  onClick?: () => void;
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

export function OutfitCard({ outfit, wearStats, onDelete, onWear, onClick }: OutfitCardProps) {
  const menuItems = [];
  if (onWear) menuItems.push({ label: "Wear it", onClick: onWear });
  if (onDelete) menuItems.push({ label: "Delete", onClick: onDelete, destructive: true });

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-900 ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">{outfit.name}</h3>
        {menuItems.length > 0 && <KebabMenu items={menuItems} />}
      </div>
      <div className="mt-1 flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
        <span>
          {outfit.itemIds.length} item{outfit.itemIds.length !== 1 && "s"}
        </span>
        {wearStats && wearStats.totalWears > 0 && (
          <>
            <span>Worn {wearStats.totalWears}x</span>
            {wearStats.lastWornAt && (
              <span>Last: {timeAgo(wearStats.lastWornAt)}</span>
            )}
          </>
        )}
      </div>
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
