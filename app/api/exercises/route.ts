import { NextRequest, NextResponse } from 'next/server';
import exercises from '@/data/exercises.json';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(exercises);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}
