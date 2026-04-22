import { NextResponse } from 'next/server';
import { mockFomc } from '@/data/mockData';
import { readPipelineJson } from '@/lib/readPipelineJson';
import type { FomcBundle } from '@/types';

export async function GET() {
  return NextResponse.json(readPipelineJson<FomcBundle>('fomc.json', mockFomc));
}
