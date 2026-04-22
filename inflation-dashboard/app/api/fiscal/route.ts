import { NextResponse } from 'next/server';
import { mockFiscal } from '@/data/mockData';

export async function GET() {
  return NextResponse.json(mockFiscal);
}
