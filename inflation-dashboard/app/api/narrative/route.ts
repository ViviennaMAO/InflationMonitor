import { NextResponse } from 'next/server';
import { mockNarrative } from '@/data/mockData';

export async function GET() {
  return NextResponse.json(mockNarrative);
}
