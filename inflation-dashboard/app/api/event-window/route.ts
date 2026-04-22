import { NextResponse } from 'next/server';
import { mockEventWindow } from '@/data/mockData';

export async function GET() {
  return NextResponse.json(mockEventWindow);
}
