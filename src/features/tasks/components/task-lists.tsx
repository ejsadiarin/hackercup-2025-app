import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@/types/task";

type TaskListProps = {
  task: Task; // now a Task object instead of string
  onRemove?: () => void;
};

export default function TaskList({ task, onRemove }: TaskListProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox disabled />
      <p>{task.title}</p> {/* display the title */}
      <button
        onClick={onRemove}
        className="ml-auto text-[#E23D29] hover:text-[#e23b29d8] text-2xl"
      >
        ×
      </button>
    </div>
  );
}
