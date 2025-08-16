import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  const { data: updatedTask, error } = await supabase
    .from('tasks')
    .update({ status: 'done' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error(`Error completing task ${id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!updatedTask) {
    return NextResponse.json({ error: 'Task not found or not authorized to update.' }, { status: 404 });
  }

  return NextResponse.json(updatedTask);
}
