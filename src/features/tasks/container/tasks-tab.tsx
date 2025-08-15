"use client";
import { useState, useEffect } from "react";
import TaskList from "../components/task-lists";
import { cn } from "@/lib/utils";
import WelcomeTab from "@/features/welcome/container/welcome-tab";
import { useCalendarStore } from "@/features/store/calendarStore";
import { Task } from "@/types/task";
import { formatDayToDate } from "../utils/format-date";

export default function TasksTab() {
  const [tasks, setNewTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false); // New state for loading

  const { selectedDay } = useCalendarStore();
  const displayDate = selectedDay
    ? `${selectedDay.dayName}, ${selectedDay.monthName} ${selectedDay.dateNum}`
    : new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });

  // Convert selected day to "YYYY-MM-DD" format
  const pgDate = selectedDay ? formatDayToDate(selectedDay) : null;
  const todayLocal = new Date();
  const todayLocalStr = `${todayLocal.getFullYear()}-${String(
    todayLocal.getMonth() + 1
  ).padStart(2, "0")}-${String(todayLocal.getDate()).padStart(2, "0")}`;

  // Fetch tasks whenever selectedDay changes
  useEffect(() => {
    if (!pgDate) {
      setNewTasks([]);
      return;
    }

    const fetchTasks = async () => {
      try {
        const res = await fetch(`/api/tasks?date=${pgDate}`);
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data: Task[] = await res.json();

        // Convert pgDate to a JS Date object at local midnight
        const selectedDateObj = new Date(pgDate + "T00:00:00");

        // Filter tasks to match the selected date
        const filtered = data.filter((task) => {
          const taskDateObj = new Date(task.start_date); // UTC timestamp from Supabase
          return (
            taskDateObj.getFullYear() === selectedDateObj.getFullYear() &&
            taskDateObj.getMonth() === selectedDateObj.getMonth() &&
            taskDateObj.getDate() === selectedDateObj.getDate()
          );
        });

        setNewTasks(filtered);
      } catch (err) {
        console.error(err);
        setNewTasks([]);
      }
    };

    fetchTasks();
  }, [pgDate]);

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

  const handleStartMyDay = async () => {
    if (isLoading) return; // Prevent multiple requests

    setIsLoading(true); // Set loading state to true
    try {
      const res = await fetch("/api/llm/suggest-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tasks), // Send the current tasks
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to suggest schedule");
      }

      const suggestedTasks: Task[] = await res.json();
      setNewTasks(suggestedTasks); // Update the tasks with the suggested schedule
      // Optionally, show a success message or re-fetch tasks
    } catch (error) {
      console.error("Error suggesting schedule:", error);
      // Optionally, show an error message to the user
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const handleRemoveTask = async (taskId: number, index: number) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete task");

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
          task={task}
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

      <div className="mt-48">
 
      </div>
    </div>
  );
}
