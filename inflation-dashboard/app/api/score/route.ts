import { NextResponse } from 'next/server';
import { mockScore } from '@/data/mockData';
import { readPipelineJson } from '@/lib/readPipelineJson';
import type { InflationScore } from '@/types';

export async function GET() {
  return NextResponse.json(readPipelineJson<InflationScore>('score.json', mockScore));
}
