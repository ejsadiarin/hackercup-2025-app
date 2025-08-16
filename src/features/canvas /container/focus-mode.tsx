"use client";
import Timer from "@/features/calendar/container/timer";

export default function FocusMode() {
  return (
    <div className="flex flex-col gap-8 p-6">
      {/* Gray Panel: Timer + Canvas */}
      <div className="bg-gray-100 rounded-lg shadow-md p-6 flex flex-col gap-6">
        {/* Timer */}
        <div className="flex justify-center">
          <Timer />
        </div>

        {/* Canvas Placeholder BELOW Timer */}
        <div className="bg-white rounded-lg shadow-inner h-96 flex items-center justify-center">
          <p className="text-gray-400">Canvas integration will appear here</p>
        </div>
      </div>

      {/* Assignment Details BELOW the gray panel */}
      <div className="bg-white rounded-lg shadow-md p-6 text-gray-800 space-y-4">
        <p>
          This is an{" "}
          <strong>open notes/resources GRADED EXERCISE (graded quiz)</strong>.
          The resulting score will contribute to your final grade.
        </p>
        <p>
          <strong>Honesty Policy and Honor Code Apply.</strong> Cheating is
          unacceptable and will result in a final grade of 0.0 for this course.
          You should turn in answers based on your individual efforts. You are
          NOT allowed to communicate with anybody about the questions and
          corresponding answers, except with your teacher.
        </p>
        <p>
          You are given at most <strong>10 attempts</strong>. If your score is
          low, you may retake the quiz. The <strong>AVERAGE score</strong> based
          on all attempts will be recorded.
        </p>
      </div>
    </div>
  );
}
