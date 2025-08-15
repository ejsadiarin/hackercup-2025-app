"use client";
import { useEffect, useState } from "react";
import IndivTask from "@/features/tasks/components/indiv-task";
import { Task } from "@/types/task";
import { formatDayToDate } from "@/features/tasks/utils/format-date";

interface TaskViewProps {
  slug: string;
}

export default function TaskView({ slug }: TaskViewProps) {
  const [selectedDate] = useState(
    slug || new Date().toISOString().split("T")[0]
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch tasks for the day
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
    <div className="relative flex justify-center items-center w-full p-4">
      {/* Left Arrow */}
      <button
        onClick={prevTask}
        disabled={currentIndex === 0}
        className="absolute left-2 text-2xl font-bold opacity-50 hover:opacity-100 disabled:opacity-25"
      >
        ←
      </button>

      {/* Task Card */}
      <IndivTask>
        <div className="flex flex-col items-center gap-2 p-6">
          <p className="font-bold text-lg text-center">
            {tasks[currentIndex].task_type}
          </p>
        </div>
      </IndivTask>

      {/* Right Arrow */}
      <button
        onClick={nextTask}
        disabled={currentIndex === tasks.length - 1}
        className="absolute right-2 text-2xl font-bold opacity-50 hover:opacity-100 disabled:opacity-25"
      >
        →
      </button>
    </div>
  );
}
