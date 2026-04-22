import { NextResponse } from 'next/server';
import { mockPriceDecomp } from '@/data/mockData';

export async function GET() {
  return NextResponse.json(mockPriceDecomp);
}
