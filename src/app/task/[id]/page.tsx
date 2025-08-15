import TaskView from "@/features/tasks/container/task-view";

interface TaskPageProps {
  params: { slug: string }; // the date slug from the URL
}

export default function TaskPage({ params }: TaskPageProps) {
  return <TaskView slug={params.slug} />;
}
