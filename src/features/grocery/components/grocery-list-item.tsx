"use client";

import { Checkbox } from "@/components/ui/checkbox";

type GroceryListItemProps = {
  item: {
    id: number;
    name: string;
    price: number;
  };
  onRemove?: () => void;
};

export default function GroceryListItem({
  item,
  onRemove,
}: GroceryListItemProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded shadow-sm">
      <Checkbox disabled />
      <span className="flex-1">{item.name}</span>
      <span className="font-medium text-gray-700">
        ₱{item.price.toFixed(2)}
      </span>
      <button
        onClick={onRemove}
        className="ml-2 text-[#E23D29] hover:text-[#e23b29d8] text-2xl"
      >
        ×
      </button>
    </div>
  );
}
