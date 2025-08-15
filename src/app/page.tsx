import TasksTab from "@/features/tasks/container/tasks-tab";
import ProfileTab from "@/features/user/component/profile-tab";

export default function TaskView() {
  return (
    <>
      <div className="p-12">
        <ProfileTab />
        <TasksTab />
      </div>
    </>
  );
}
