"use client";
import { useState } from "react";
import TaskList from "../components/task-lists";
import { cn } from "@/lib/utils";
import WelcomeTab from "@/features/welcome/container/welcome-tab";
import { useCalendarStore } from "@/features/store/calendarStore";
import { Task } from "@/types/task";
import { formatDayToDate } from "../utils/format-date";

export default function TasksTab() {
  const [tasks, setNewTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");

  const { selectedDay } = useCalendarStore();
  console.log(selectedDay);

  let pgTimestamp: string | null = null;
  if (selectedDay) {
    pgTimestamp = formatDayToDate(selectedDay);
    console.log(pgTimestamp);
  }

  const displayDate = selectedDay
    ? `${selectedDay.dayName}, ${selectedDay.monthName} ${selectedDay.dateNum}`
    : new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  // Map month names to numbers for Date
  const monthMap: Record<string, number> = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };

  const addTaskToDB = async (title: string) => {
    const task: Omit<Task, "id" | "start_date" | "user_id" | "end_date"> = {
      title,
      status: "inprogress",
      task_type: null,
    };

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });

      if (!res.ok) throw new Error("Failed to create task");

      const createdTask: Task = await res.json();
      setNewTasks((prev) => [...prev, createdTask]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = () => {
    if (newTask.trim() === "") return;
    addTaskToDB(newTask.trim());
    setNewTask("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTask.trim() !== "") {
      handleAddTask();
    }
  };

  const handleRemoveTask = async (taskId: number, index: number) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete task");

      // Remove from local state
      setNewTasks((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-12">
      <div className="flex bg-white z-10 py-2">
        <h1 className="font-bold">{displayDate}</h1>
      </div>

      {tasks.map((task, index) => (
        <TaskList
          key={task.id}
          task={task} // pass the Task object
          onRemove={() => handleRemoveTask(task.id, index)}
        />
      ))}

      <div className="flex items-center gap-2">
        <button
          onClick={handleAddTask}
          className={cn(
            "flex items-center justify-center",
            "w-6 h-6 rounded-md",
            "bg-[#A600A9] text-white font-bold",
            "hover:bg-[#a600a9c8] transition-colors"
          )}
        >
          +
        </button>
        <input
          type="text"
          placeholder="Add a new Todo list"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border-b-2 border-black outline-none px-2 py-1"
        />
      </div>

      <div className="mt-20 flex justify-center">
        <WelcomeTab />
      </div>

      {/* Start My Day Button at the bottom */}
      <div className="mt-48">
        <button className="flex w-full justify-center border-2 bg-[#A600A9] outline-none text-white px-4 py-2 rounded-lg font-bold">
          Start my Day!
        </button>
      </div>
    </div>
  );
}
