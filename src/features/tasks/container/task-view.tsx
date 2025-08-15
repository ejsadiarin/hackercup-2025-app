import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function TaskView() {
  return (
    <>
      <main className="min-h-screen">
        <section className="px-8 py-12">
          <span className="flex items-center gap-2">
            <Checkbox disabled />
            <h2 className="text-xl">Schedule Dentist Appointment</h2>
          </span>
        </section>
        {/* TEMP */}
        <section className="h-[576px] bg-slate-600"></section>
        <section className="px-8 py-12">
          <Button className="block max-w-96 w-full mx-auto text-xl h-fit font-medium">
            Complete
          </Button>
        </section>
      </main>
    </>
  );
}
