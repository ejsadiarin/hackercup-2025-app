import { Task } from "@/types/task";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: number) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete task");
      }

      return taskId; // return deleted id
    },
    onSuccess: (deletedId) => {
      // Remove the task from the cache immediately
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.setQueryData<Task[]>(
        ["tasks"],
        (old) => old?.filter((t) => t.id !== deletedId) ?? []
      );
    },
  });
}
