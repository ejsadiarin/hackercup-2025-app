"use client";
import { useState, useEffect } from "react"; // Import useState and useEffect
import Timer from "@/features/calendar/container/timer";
import { CalendarDays, FileText, User } from "lucide-react";

// Define the CanvasAssignment interface
interface CanvasAssignment {
  id: string;
  title: string;
  courseCode: string;
  dueDate: string;
  instructor: string;
  details: string[];
  canvasUrl: string;
}

export default function FocusMode() {
  const [assignment, setAssignment] = useState<CanvasAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await fetch("/api/canvas/assignment/canvas-assign-1"); // Fetch mock assignment 1
        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }
        const data: CanvasAssignment = await res.json();
        setAssignment(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignment();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 p-6 items-center">
        <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center gap-6 w-full max-w-md">
          <p>Loading Canvas assignment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-8 p-6 items-center">
        <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center gap-6 w-full max-w-md">
          <p className="text-red-500">Error loading Canvas assignment: {error}</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col gap-8 p-6 items-center">
        <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center gap-6 w-full max-w-md">
          <p>No Canvas assignment found.</p>
        </div>
      </div>
    );
  }

  // Format due date
  const dueDate = new Date(assignment.dueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
              {assignment.title}
            </h2>
            <button className="text-gray-500 hover:text-gray-700">⌄</button>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <FileText size={16} />
            <span>MERGED - {assignment.courseCode}/....</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CalendarDays size={16} />
            <span>{dueDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <User size={16} />
            <span>{assignment.instructor}</span>
          </div>

          {/* Button */}
          <a
            href={assignment.canvasUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 w-full bg-black text-white text-sm font-medium py-2 rounded-md flex items-center justify-center gap-2 hover:bg-gray-800"
          >
            Open in Canvas
            <span>↗</span>
          </a>
        </div>
      </div>

      {/* Assignment Details */}
      <div className="bg-white rounded-lg shadow-md p-6 text-gray-800 space-y-4 w-full max-w-2xl">
        {assignment.details.map((paragraph, index) => (
          <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }}></p>
        ))}
      </div>
    </div>
  );
}
