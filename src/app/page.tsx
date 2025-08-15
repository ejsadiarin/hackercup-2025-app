import CalendarTab from "@/features/calendar/container/calendar-tab";
import MapComponent from "@/features/map/component/map";
import TasksTab from "@/features/tasks/container/tasks-tab";
import ProfileTab from "@/features/user/component/profile-tab";

export default function TaskTabPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Full-width sticky header */}
      <div className="sticky top-0 z-20 bg-white w-full px-12">
        <div className="pt-6">
          <ProfileTab />
        </div>
        <CalendarTab />
      </div>
      {/* Scrollable tasks section */}
      <div className="flex-1 overflow-y-auto pt-12 py-4 px-12">
        <TasksTab />
      </div>
    </div>
  );
}
