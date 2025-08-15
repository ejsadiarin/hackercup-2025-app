import { Checkbox } from "@/components/ui/checkbox";

type taskListProps = {
  task?: string;
  onRemove?: () => void;
};

export default function TaskList({ task, onRemove }: taskListProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox disabled />
      <p>{task || "Task List"}</p>
      <button
        onClick={onRemove}
        className="ml-auto text-[#E23D29] hover:text-[#e23b29d8] text-2xl"
      >
        ×
      </button>
    </div>
  );
}
