import { NextResponse } from 'next/server';

export async function PATCH() {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. The client now updates workouts directly.' },
    { status: 410 }
  );
}
