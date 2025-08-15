export type Task = {
  id: number;
  start_date: string;
  end_date: string | null;
  title: string;
  status: 'inprogress' | 'done';
  task_type: 'bili' | 'appointment' | 'punta' | 'study' | null;
  user_id: string;
};
