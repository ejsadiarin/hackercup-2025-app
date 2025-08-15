import { Button } from "@/components/ui/button";
import Image from "next/image";

interface IndivTaskProps {
  taskId?: number;
  title?: string;
  status: "inprogress" | "done";
  children?: React.ReactNode;
}

export default function IndivTask({
  taskId,
  title,
  status,
  children,
}: Readonly<IndivTaskProps>) {
  return (
    <main className="min-h-screen">
      <section className="px-8 py-12 flex justify-center">
        <span className="flex items-center gap-2">
          <Image
            src="/adlawon.svg"
            height={80}
            width={80}
            alt="Adlawon Logo"
            className="[filter:brightness(0)_saturate(100%)_invert(14%)_sepia(87%)_saturate(6573%)_hue-rotate(295deg)_brightness(91%)_contrast(93%)]"
          />
          <h2 className="text-3xl font-semibold">{title}</h2>
        </span>
      </section>

      {children}

      <section className="px-8 py-12">
        <Button
          variant={"violet"}
          className="block max-w-96 w-full mx-auto text-xl h-fit font-semibold"
        >
          {status === "inprogress" ? "Complete Task" : "Task Completed"}
        </Button>
      </section>
    </main>
  );
}
