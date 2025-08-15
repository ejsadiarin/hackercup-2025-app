import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@/utils/supabase/server';
import type { Task } from '@/types/task';

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

  const prompt = `You are a helpful assistant that helps users organize their daily tasks.
Given an array of tasks in JSON format, your goal is to:
1. Categorize each task's 'task_type' based on its 'title'. Choose from: 'bili' (filipino word for buy), 'appointment', 'punta' (filipino word for go), 'study'. If unsure, set to null.
2. Suggest a reasonable 'end_date' for each task, assuming a typical workday. The 'end_date' should be a full ISO 8601 timestamp (e.g., 'YYYY-MM-DDTHH:MM:SS.sssZ'). If 'start_date' is provided, 'end_date' should be after 'start_date'. Assume tasks are for the same day as their 'start_date'.
3. Return the updated array of tasks in the exact same JSON format. Do not include any other text or explanation.

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
${JSON.stringify(tasks)}`;

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

    const updatedTasksInDb: Task[] = [];
    for (const suggestedTask of suggestedTasks) {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          end_date: suggestedTask.end_date,
          task_type: suggestedTask.task_type,
        })
        .eq('id', suggestedTask.id)
        .eq('user_id', user.id) // ensure the task belongs to the authenticated user before updating
        .select()
        .single();

      if (error) {
        console.error(`Error updating task ${suggestedTask.id}:`, error);
      } else if (data) {
        updatedTasksInDb.push(data);
      }
    }

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
