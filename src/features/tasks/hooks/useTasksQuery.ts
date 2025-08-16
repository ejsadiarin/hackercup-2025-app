import { Task } from "@/types/task";
import { useQuery } from "@tanstack/react-query";

async function fetchTasks(params?: { start_date?: string }) {
  const url = new URL("/api/tasks/by-date", window.location.origin);
  console.log(url.toString());

  if (params?.start_date) url.searchParams.append("date", params.start_date);

  const res = await fetch(url.toString());
  console.log(url.toString());
  if (!res.ok) throw new Error("Failed to fetch tasks");

  const data = await res.json();

  return data;
}

export function useTasksQuery(startDate?: string) {
  return useQuery<Task[]>({
    queryKey: ["tasks", { start_date: startDate }], // ✅ Include start_date in queryKey
    queryFn: () => fetchTasks({ start_date: startDate }),
    enabled: !!startDate, // Only fetch when startDate is defined
  });
}
