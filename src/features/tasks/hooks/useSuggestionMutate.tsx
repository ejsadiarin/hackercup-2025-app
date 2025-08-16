import { useMutation } from "@tanstack/react-query";
import type { Task } from "@/types/task";

export function useSuggestScheduleMutation() {
  return useMutation({
    mutationFn: async (tasks: Task[]) => {
      const res = await fetch("/api/llm/suggest-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tasks),
      });

      if (!res.ok) {
        throw new Error("Failed to suggest schedule");
      }

      return res.json(); // The API response, e.g., suggested tasks or schedule
    },
  });
}
