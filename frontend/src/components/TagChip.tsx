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
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-700"
      } ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      {tag}
    </button>
  );
}
