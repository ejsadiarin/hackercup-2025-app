import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const filePath = path.join(process.cwd(), 'mock-canvas-assignments.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const assignments = JSON.parse(fileContents);

    const assignment = assignments.find((assign: any) => assign.id === id);

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error fetching mock Canvas assignment:', error);
    return NextResponse.json({ error: 'Failed to retrieve assignment.' }, { status: 500 });
  }
}
