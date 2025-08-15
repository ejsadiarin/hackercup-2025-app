import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function TaskView({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="min-h-screen">
        <section className="px-8 py-12">
          <span className="flex items-center gap-2">
            <Checkbox disabled />
            <h2 className="text-2xl font-semibold">
              Schedule Dentist Appointment
            </h2>
          </span>
        </section>
        {/* TEMP */}
        {children}
        <section className="px-8 py-12">
          <Button
            variant={"violet"}
            className="block max-w-96 w-full mx-auto text-xl h-fit font-semibold"
          >
            Complete Task
          </Button>
        </section>
      </main>
    </>
  );
}
