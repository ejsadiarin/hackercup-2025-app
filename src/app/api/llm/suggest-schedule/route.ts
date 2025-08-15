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

  const prompt = `You are a helpful assistant that helps users organize their daily tasks.
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

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: prompt }],
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

    const suggestedTasks: Task[] = JSON.parse(jsonString);

    if (!Array.isArray(suggestedTasks)) {
      return NextResponse.json({ error: 'LLM did not return a valid array of tasks.' }, { status: 500 });
    }

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
