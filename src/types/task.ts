export type Task = {
  id: number;
  created_at: string;
  due_date: string | null;
  title: string;
  status: "inprogress" | "done";
  task_type: string | null;
  user_id: string;
};
