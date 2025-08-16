import ScheduleContainer from "@/features/calendar/container/schedule-view";

export default function SchedulePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  console.log(slug);
  return (
    <>
      <ScheduleContainer slug={slug} />
    </>
  );
}
