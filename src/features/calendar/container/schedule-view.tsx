"use client";

import { Button } from "@/components/ui/button";
import DayPlanner from "../component/day-planner";
import { formatToday } from "../utils/layout-utils";
import { useTasksQuery } from "@/features/tasks/hooks/useTasksQuery";
import { useCalendarStore } from "@/features/store/calendarStore";
import { formatDayToDate } from "@/features/tasks/utils/format-date";

export default function ScheduleContainer({ slug }: { slug: string }) {
  return (
    <>
      <main>
        <div className="p-4">
          <h1 className="text-3xl font-bold">Schedule</h1>
          <h3 className="text-lg font-semibold">{formatToday()}</h3>
          <p className="text-md font-light mt-2">
            Based on your tasks, here&apos;s a suggested schedule.
          </p>
        </div>
        <DayPlanner slug={slug} />

        <p className=" text-center my-4 font-light">
          drag around the timeblocks to adjust schedule
        </p>

        <Button
          variant="default"
          className="block max-w-96 w-full mx-auto"
          onClick={() => {
            window.location.href = "/task";
          }}
        >
          Confirm
        </Button>
      </main>
    </>
  );
}
