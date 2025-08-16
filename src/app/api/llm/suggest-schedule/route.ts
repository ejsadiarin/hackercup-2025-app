import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@/utils/supabase/server';
import type { Task } from '@/types/task';

function categorizeTaskType(title: string): Task['task_type'] {
  const lowerTitle = title.toLowerCase();

  // Keywords for 'bili' (buy)
  const biliKeywords = ['buy', 'purchase', 'shop', 'acquire', 'get'];
  if (biliKeywords.some(keyword => lowerTitle.includes(keyword))) {
    return 'bili';
  }

  // Keywords for 'appointment'
  const appointmentKeywords = ['appoint', 'schedule', 'meeting', 'meet', 'consultation', 'session'];
  if (appointmentKeywords.some(keyword => lowerTitle.includes(keyword))) {
    return 'appointment';
  }

  // Keywords for 'punta' (go)
  const puntaKeywords = ['go', 'visit', 'travel', 'head to', 'drive to', 'walk to'];
  if (puntaKeywords.some(keyword => lowerTitle.includes(keyword))) {
    return 'punta';
  }

  // Keywords for 'study'
  const studyKeywords = ['study', 'aral', 'learn', 'review', 'read', 'prepare for'];
  if (studyKeywords.some(keyword => lowerTitle.includes(keyword))) {
    return 'study';
  }

  return null; // Default if no category matches
}

// Helper to add minutes to a Date object
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

function generateScheduleLocally(tasks: Task[]): Task[] {
  // Sort tasks by their current start_date to ensure sequential scheduling
  // If start_date is null, place them at the end or assign a default early time
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.start_date && b.start_date) {
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    }
    if (a.start_date) return -1; // Tasks with start_date come first
    if (b.start_date) return 1;
    return 0; // Both null, maintain original order
  });

  const scheduledTasks: Task[] = [];
  let currentTime = new Date(); // Start scheduling from now or a fixed start of day

  // For a more dynamic approach, we can start from a fixed time like 9 AM today
  const today = new Date();
  today.setHours(9, 0, 0, 0); // Set to 9:00:00.000 today
  currentTime = today;

  for (const task of sortedTasks) {
    // Ensure task starts after the previous one ends, plus a 15-minute gap
    if (scheduledTasks.length > 0) {
      const lastTaskEndTime = new Date(scheduledTasks[scheduledTasks.length - 1].end_date || currentTime);
      currentTime = addMinutes(lastTaskEndTime, 15);
    }

    // Assign a default duration (e.g., 1 hour)
    const durationMinutes = 60; // Can be made dynamic, e.g., random(30, 120)

    const newStartDate = currentTime;
    const newEndDate = addMinutes(newStartDate, durationMinutes);

    scheduledTasks.push({
      ...task,
      start_date: newStartDate.toISOString(),
      end_date: newEndDate.toISOString(),
    });

    currentTime = newEndDate; // Update current time for the next task
  }

  return scheduledTasks;
}

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tasks: Task[] = await req.json();

  if (!tasks || !Array.isArray(tasks)) {
    return NextResponse.json({ error: 'Invalid tasks array provided' }, { status: 400 });
  }

  // Apply local categorization
  const categorizedTasks = tasks.map(task => ({
    ...task,
    task_type: categorizeTaskType(task.title),
  }));

  // LLM Prompt (kept for reference/show)
  const llmPrompt = `You are a helpful assistant that helps users organize their daily tasks.
Given an array of tasks in JSON format, your goal is to:
1. Suggest a reasonable 'start_date' and 'end_date' for each task, assuming a typical workday. Both 'start_date' and 'end_date' should be full ISO 8601 timestamps (e.g., 'YYYY-MM-DDTHH:MM:SS.sssZ'). Ensure 'end_date' is after 'start_date'. Tasks should be scheduled for the same day as their original 'start_date'. Crucially, ensure there are no overlaps between tasks, and maintain at least a 15-minute gap between the end of one task and the start of the next (e.g., if Task 1 ends at 5:00 PM, Task 2 should start at 5:15 PM or later).
2. Return the updated array of tasks in the exact same JSON format. Do not include any other text or explanation.

Example Input:
[
  {
    "id": 1,
    "start_date": "2025-08-15T09:00:00.000Z",
    "end_date": null,
    "title": "Buy groceries for dinner",
    "status": "inprogress",
    "task_type": null,
    "user_id": "some-uuid"
  }
]

Example Output:
[
  {
    "id": 1,
    "start_date": "2025-08-15T09:00:00.000Z",
    "end_date": "2025-08-15T10:00:00.000Z",
    "title": "Buy groceries for dinner",
    "status": "inprogress",
    "task_type": "bili",
    "user_id": "some-uuid"
  }
]

Tasks to process:
${JSON.stringify(categorizedTasks)}`;

  // --- LLM Call  ---
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: llmPrompt }],
    });
    const text = result.text;

    if (typeof text !== 'string') {
      return NextResponse.json({ error: 'LLM did not return valid text.' }, { status: 500 });
    }

    // Extract JSON from markdown code block if present
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    let jsonString = text;
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1];
    }

    const parsedSuggestedTasks: Task[] = JSON.parse(jsonString);

    if (!Array.isArray(parsedSuggestedTasks)) {
      return NextResponse.json({ error: 'LLM did not return a valid array of tasks.' }, { status: 500 });
    }
    const suggestedTasks: Task[] = parsedSuggestedTasks; // This line is now active

    // Scheduling Implementation (commented out)
    // try {
    //   const suggestedTasks: Task[] = generateScheduleLocally(categorizedTasks);

    const updatePromises = suggestedTasks.map(async (suggestedTask) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          start_date: suggestedTask.start_date,
          end_date: suggestedTask.end_date,
          task_type: categorizedTasks.find(t => t.id === suggestedTask.id)?.task_type || null, // Use locally categorized type
        })
        .eq('id', suggestedTask.id)
        .eq('user_id', user.id) // ensure the task belongs to the authenticated user before updating
        .select()
        .single();

      if (error) {
        console.error(`Error updating task ${suggestedTask.id} for user ${user.id}:`, error);
        return null; // Return null or handle error as needed
      }
      return data;
    });

    const updatedTasksInDb = (await Promise.all(updatePromises)).filter(Boolean); // Filter out nulls

    return NextResponse.json(updatedTasksInDb);
  } catch (error: any) {
    console.error('Error during LLM integration:', error);
    // attempt to parse error message if it's a JSON string
    let errorMessage = 'An unexpected error occurred';
    try {
      const errorObj = JSON.parse(error.message);
      if (errorObj.error && errorObj.error.message) {
        errorMessage = errorObj.error.message;
      }
    } catch (parseError) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
