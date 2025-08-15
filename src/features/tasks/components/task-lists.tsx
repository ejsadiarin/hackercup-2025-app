import { Checkbox } from "@/components/ui/checkbox";

type taskListProps = {
  task?: String;
};

export default function TaskList({ task }: taskListProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Checkbox disabled /> <p>{task || "Task List "}</p>
      </div>
    </>
  );
}
