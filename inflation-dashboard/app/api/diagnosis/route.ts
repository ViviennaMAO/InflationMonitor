import { NextResponse } from 'next/server';
import { mockDiagnosis } from '@/data/mockData';

export async function GET() {
  return NextResponse.json(mockDiagnosis);
}
