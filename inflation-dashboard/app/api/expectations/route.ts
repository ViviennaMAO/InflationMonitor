import { NextResponse } from 'next/server';
import { mockExpectations } from '@/data/mockData';

export async function GET() {
  return NextResponse.json(mockExpectations);
}
