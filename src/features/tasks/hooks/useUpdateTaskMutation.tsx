import { Task } from "@/types/task";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type TaskUpdatePayload = {
  id: number;
  start_date?: string; // optional now
  end_date?: string; // optional now
};

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<TaskUpdatePayload>) => {
      const res = await fetch(`/api/tasks/${payload.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to update task");
      }
      return res.json() as Promise<Task>;
    },
    onSuccess: (updatedTask) => {
      // Update tasks query cache immediately
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.setQueryData<Task[]>(
        ["tasks"],
        (old) =>
          old?.map((t) => (t.id === updatedTask.id ? updatedTask : t)) ?? []
      );
    },
  });
}
