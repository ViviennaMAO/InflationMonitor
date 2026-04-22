import { NextResponse } from 'next/server';
import { mockSignalTimeline } from '@/data/mockData';

export async function GET() {
  return NextResponse.json(mockSignalTimeline);
}
