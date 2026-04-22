import { NextResponse } from 'next/server';
import { mockHistory } from '@/data/mockData';

export async function GET() {
  return NextResponse.json(mockHistory);
}
