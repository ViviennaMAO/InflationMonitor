import { NextResponse } from 'next/server';
import { mockScenarios } from '@/data/mockData';
import { readPipelineJson } from '@/lib/readPipelineJson';
import type { ScenarioBundle } from '@/types';

export async function GET() {
  return NextResponse.json(readPipelineJson<ScenarioBundle>('scenarios.json', mockScenarios));
}
