"use client";
import { useState } from "react";
import TaskList from "../components/task-lists";
import { cn } from "@/lib/utils";
import WelcomeTab from "@/features/welcome/container/welcome-tab";
import { useCalendarStore } from "@/features/store/calendarStore";

export default function TasksTab() {
  const [tasks, setNewTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState<string>("");

  const { selectedDay } = useCalendarStore();

  const displayDate = selectedDay
    ? `${selectedDay.dayName}, ${selectedDay.monthName} ${selectedDay.dateNum}`
    : new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTask.trim() !== "") {
      setNewTasks((prev) => [...prev, newTask.trim()]);
      setNewTask("");
    }
  };

  const handleAddTask = () => {
    if (newTask.trim() !== "") {
      setNewTasks((prev) => [...prev, newTask.trim()]);
      setNewTask("");
    }
  };

  const handleRemoveTask = (index: number) => {
    setNewTasks((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-4 pb-12">
      <div className="flex bg-white z-10 py-2">
        <h1 className="font-bold">{displayDate}</h1>
      </div>

      {tasks.map((task, index) => (
        <TaskList
          key={index}
          task={task}
          onRemove={() => handleRemoveTask(index)}
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
