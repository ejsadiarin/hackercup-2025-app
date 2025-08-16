"use client";
import Timer from "@/features/calendar/container/timer";
import { CalendarDays, FileText, User } from "lucide-react";

export default function FocusMode() {
  return (
    <div className="flex flex-col gap-8 p-6 items-center">
      {/* Timer + Canvas Info */}
      <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center gap-6 w-full max-w-md">
        {/* Timer */}
        <Timer className="w-full" />

        {/* Canvas Integration Card */}
        <div className="w-full border rounded-lg p-4 space-y-3">
          {/* Title */}
          <div className="flex items-start gap-2">
            <img
              src="/canvas-icon.png" // replace with actual Canvas icon path
              alt="Canvas"
              className="w-6 h-6"
            />
            <h2 className="font-semibold text-sm flex-1">
              GE-06: Stacks & Queues (Basic Knowledge)
            </h2>
            <button className="text-gray-500 hover:text-gray-700">⌄</button>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <FileText size={16} />
            <span>MERGED - 1243_CCDSALG_S11/....</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CalendarDays size={16} />
            <span>August 23, 2025</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <User size={16} />
            <span>SALVADOR, FLORANTE</span>
          </div>

          {/* Button */}
          <button className="mt-2 w-full bg-black text-white text-sm font-medium py-2 rounded-md flex items-center justify-center gap-2 hover:bg-gray-800">
            Open in Canvas
            <span>↗</span>
          </button>
        </div>
      </div>

      {/* Assignment Details */}
      <div className="bg-white rounded-lg shadow-md p-6 text-gray-800 space-y-4 w-full max-w-2xl">
        <p>
          This is an{" "}
          <strong>open notes/resources GRADED EXERCISE (graded quiz)</strong>.
          The resulting score will contribute to your final grade.
        </p>
        <p>
          <strong>Honesty Policy and Honor Code Apply.</strong> Cheating is an
          unacceptable behavior which will result in a final grade of 0.0 for
          this course. You should turn in answers based on your individual
          efforts. Except with your teacher, you are NOT allowed to communicate
          with anybody about the questions and corresponding answers.
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
