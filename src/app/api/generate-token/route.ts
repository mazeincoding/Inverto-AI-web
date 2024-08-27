import { NextResponse } from 'next/server';

export async function GET() {
  const token = Math.random().toString(36).substring(2, 15);
  const submit_time = Date.now();

  return NextResponse.json({ token, submit_time });
}
