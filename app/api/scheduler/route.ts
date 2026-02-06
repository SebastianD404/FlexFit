import { NextRequest, NextResponse } from 'next/server';
import { generateWorkoutPlan } from '@/lib/algorithms/scheduler';
import { SchedulerInput, Exercise } from '@/types';
import exercises from '@/data/exercises.json';

export async function POST(request: NextRequest) {
  try {
    const body: SchedulerInput & { userId: string } = await request.json();

    if (!body.userId || !body.availableDays || body.availableDays.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, availableDays' },
        { status: 400 }
      );
    }

    const plan = generateWorkoutPlan(
      {
        availableDays: body.availableDays,
        experience: body.experience,
        goal: body.goal,
        minutesPerSession: body.minutesPerSession,
      },
      exercises as Exercise[],
      body.userId
    );

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Scheduler error:', error);
    return NextResponse.json(
      { error: 'Failed to generate workout plan' },
      { status: 500 }
    );
  }
}
