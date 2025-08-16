"use client";
import { useEffect, useState } from "react";
import IndivTask from "@/features/tasks/components/indiv-task";
import { Task } from "@/types/task";
import GroceryTab from "@/features/grocery/container/grocery-tab";
import EmailTab from "@/features/email/container/email-tab";
import Timer from "@/features/calendar/container/timer";
import FocusMode from "@/features/canvas /container/focus-mode";

interface TaskViewProps {
  slug: string;
}

export default function TaskView({ slug }: TaskViewProps) {
  const [selectedDate] = useState(
    slug || new Date().toISOString().split("T")[0]
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`/api/tasks?date=${selectedDate}`);
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data: Task[] = await res.json();
        setTasks(data);
        setCurrentIndex(0);
      } catch (err) {
        console.error(err);
        setTasks([]);
      }
    };
    fetchTasks();
  }, [selectedDate]);

  const nextTask = () =>
    setCurrentIndex((prev) => Math.min(prev + 1, tasks.length - 1));
  const prevTask = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  if (!tasks.length)
    return <p className="text-center mt-20">No tasks for {selectedDate}</p>;

  return (
    <div className="relative flex flex-col justify-center items-center w-full p-4">
      {/* Left Arrow */}
      <button
        onClick={prevTask}
        disabled={currentIndex === 0}
        className="absolute left-2 top-1/2 -translate-y-1/2 text-2xl font-bold opacity-50 hover:opacity-100 disabled:opacity-25"
      >
        ←
      </button>

      {/* Task Card */}
      <IndivTask
        title={tasks[currentIndex].title}
        taskId={tasks[currentIndex].id}
        status={tasks[currentIndex].status}
      >
        {tasks[currentIndex].task_type === "bili" && <GroceryTab />}
        {tasks[currentIndex].task_type === "appointment" && <EmailTab />}
        {tasks[currentIndex].task_type === "punta" && <FocusMode />}
        {tasks[currentIndex].task_type === "study" && <Timer />}
      </IndivTask>

      {/* Right Arrow */}
      <button
        onClick={nextTask}
        disabled={currentIndex === tasks.length - 1}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-2xl font-bold opacity-50 hover:opacity-100 disabled:opacity-25"
      >
        →
      </button>

      {/* Carousel Indicators */}
      <div className="flex gap-2 mt-4">
        {tasks.map((_, index) => (
          <span
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex ? "bg-[#A600A9] scale-110" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
