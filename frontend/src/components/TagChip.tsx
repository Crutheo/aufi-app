interface TagChipProps {
  tag: string;
  active?: boolean;
  onClick?: () => void;
}

export function TagChip({ tag, active, onClick }: TagChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active
          ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
      } ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      {tag}
    </button>
  );
}
