import { Button } from "@/components/ui/button";
import DayPlanner from "../component/day-planner";
import { formatToday } from "../utils/layout-utils";

export default function ScheduleContainer() {
  return (
    <>
      <main>
        <div className="p-4">
          <h1 className="text-2xl font-bold">Schedule</h1>
          <h3 className="text-lg font-semibold">{formatToday()}</h3>
          <p className="text-md font-light mt-2">
            Based on your tasks, here&apos;s a suggested schedule.
          </p>
        </div>
        <DayPlanner />

        <p className=" text-center my-4 font-light">
          drag around the timeblocks to adjust schedule
        </p>

        <Button variant="default" className="block max-w-64 w-full mx-auto">
          Confirm
        </Button>
      </main>
    </>
  );
}
