import { Task } from "@/types/task";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type TaskPayload = Omit<Task, "id" | "start_date" | "user_id" | "end_date">;

export default function useAddTaskMutate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TaskPayload) => {
      const res = await fetch(`/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to post station");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error(error.message || "Failed to add station");
    },
  });
}
