"use client";
import { useState } from "react";
import TaskList from "../components/task-lists";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TasksTab() {
  const [tasks, setNewTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState<string>("");

  //When User Clicks Enter Key to Add a New Task
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTask.trim() !== "") {
      setNewTasks((prev) => [...prev, newTask.trim()]);
      setNewTask("");
    }
  };

  return (
    <>
      <div className="mt-20 flex flex-col justify-center gap-2">
        {/* Render the Tasks */}
        <ScrollArea className="h-[280px]  p-4">
          {tasks.map((task, index) => (
            <TaskList key={index} task={task} />
          ))}
        </ScrollArea>
        <div className="flex items-center gap-2">
          <Checkbox className="border-2- border-black" />{" "}
          <input
            type="text"
            placeholder="Add a new Todo list"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-b-2 border-black outline-none px-2 py-1"
          />
        </div>
        <div className="flex justify-center mt-12">
          <button className="border-2 border-black bg-black text-white px-4 py-2 rounded-lg font-bold">
            Start my Day!
          </button>
        </div>
      </div>
    </>
  );
}
