import { Checkbox } from "@/components/ui/checkbox";

type GroceryListItemProps = {
  item: {
    id: number;
    name: string;
  };
  onRemove?: () => void;
};

export default function GroceryListItem({
  item,
  onRemove,
}: GroceryListItemProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox disabled />
      <p>{item.name}</p>
      <button
        onClick={onRemove}
        className="ml-auto text-[#E23D29] hover:text-[#e23b29d8] text-2xl"
      >
        ×
      </button>
    </div>
  );
}
