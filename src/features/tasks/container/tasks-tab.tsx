"use client";
import { useState, useEffect } from "react";
import TaskList from "../components/task-lists";
import { cn } from "@/lib/utils";
import WelcomeTab from "@/features/welcome/container/welcome-tab";
import { useCalendarStore } from "@/features/store/calendarStore";
import { Task } from "@/types/task";
import { formatDayToDate, formatWeekToDay } from "../utils/format-date";
import Link from "next/link";
import { useTasksQuery } from "../hooks/useTasksQuery";
import useAddTaskMutate from "../hooks/useAddTaskMutation";
import { useDeleteTaskMutation } from "../hooks/useDeleteTaskMutate";
import { useSuggestScheduleMutation } from "../hooks/useSuggestionMutate";

export default function TasksTab() {
  const [newTask, setTask] = useState<string>("");
  const [suggestedTasks, setSuggestedTasks] = useState<Task[]>([]);
  const { selectedDay, setSelectedDay } = useCalendarStore();
  const {
    data: apiTasks,
    isLoading,
    error,
  } = useTasksQuery(selectedDay ? formatDayToDate(selectedDay) : undefined);

  const addTaskMutation = useAddTaskMutate();
  const deleteTaskMutation = useDeleteTaskMutation();
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

  const addTaskToDB = (title: string) => {
    const task: Omit<Task, "id" | "user_id"> = {
      title,
      status: "inprogress",
      task_type: null,
      start_date: selectedDay ? formatDayToDate(selectedDay) ?? "" : "",
      end_date: selectedDay ? formatDayToDate(selectedDay) ?? "" : "",
    };

    addTaskMutation.mutate(task);
  };

  const { mutate, data } = useSuggestScheduleMutation();

  const handleAddTask = () => {
    if (newTask.trim() === "") return;
    addTaskToDB(newTask.trim());
    setTask("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTask.trim() !== "") {
      handleAddTask();
    }
  };

  const handleStartMyDay = async () => {
    try {
      mutate(apiTasks ?? [], {
        onSuccess: (t) => {
          console.log("Suggested tasks:", t);
          setSuggestedTasks(t); // Update the tasks with the suggested schedule
          // optionally update cache or state here
        },
        onError: (err) => console.error(err),
      });

      // Optionally, show a success message or re-fetch tasks
    } catch (error) {
      console.error("Error suggesting schedule:", error);
      // Optionally, show an error message to the user
    }
  };

  const handleRemoveTask = async (taskId: number, index: number) => {
    deleteTaskMutation.mutate(taskId);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Oops!</h1>
        <p className="text-lg text-gray-700 mb-6">
          Failed to load tasks. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#A600A9] text-white rounded-md hover:bg-[#a600a9c8] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-12">
      <div className="flex bg-white z-10 py-2">
        <h1 className="font-bold">{displayDate}</h1>
      </div>

      {apiTasks &&
        apiTasks.map((task, index) => (
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
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border-b-2 border-black outline-none px-2 py-1"
        />
      </div>

      <div className="mt-20 flex justify-center">
        <WelcomeTab />
      </div>

      <div className="mt-48">
        <Link
          href={`/schedule/${selectedDay ? formatDayToDate(selectedDay) : ""}`}
        >
          <button
            onClick={handleStartMyDay}
            disabled={pgDate !== todayLocalStr || isLoading} // disabled if not today or loading
            className={cn(
              "flex w-full justify-center border-2 px-4 py-2 rounded-lg font-bold",
              pgDate === todayLocalStr
                ? "bg-[#A600A9] text-white cursor-pointer hover:bg-[#a600a9c8]"
                : "bg-gray-400 text-gray-200 cursor-not-allowed",
              isLoading && "opacity-70 cursor-wait" // optional visual feedback for loading
            )}
          >
            {isLoading ? "Loading..." : "Start my Day!"}
          </button>
        </Link>
      </div>
    </div>
  );
}
