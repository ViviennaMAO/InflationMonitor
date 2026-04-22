import { NextResponse } from 'next/server';
import { mockComponents } from '@/data/mockData';
import { readPipelineJson } from '@/lib/readPipelineJson';
import type { ComponentDetail } from '@/types';

export async function GET() {
  return NextResponse.json(readPipelineJson<ComponentDetail[]>('components.json', mockComponents));
}
