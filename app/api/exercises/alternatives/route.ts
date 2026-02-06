import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { muscleGroup, currentExerciseId, difficulty } = body;

    if (!muscleGroup) {
      return NextResponse.json(
        { error: 'Muscle group is required' },
        { status: 400 }
      );
    }

    // Load exercises from JSON file
    const exercisesPath = path.join(process.cwd(), 'src/data/exercises.json');
    const exercisesData = JSON.parse(fs.readFileSync(exercisesPath, 'utf-8'));

    // Filter exercises that target the same muscle group
    const alternatives = exercisesData.exercises
      .filter((exercise: any) => 
        exercise.muscleGroup === muscleGroup && 
        exercise.id !== currentExerciseId &&
        (!difficulty || exercise.difficulty === difficulty)
      )
      .slice(0, 3); // Return top 3 alternatives

    if (alternatives.length === 0) {
      return NextResponse.json(
        { error: 'No alternative exercises found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ alternatives });
  } catch (error) {
    console.error('Failed to fetch alternatives:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alternative exercises' },
      { status: 500 }
    );
  }
}
