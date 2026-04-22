import { NextResponse } from 'next/server';
import { mockAssets } from '@/data/mockData';
import { readPipelineJson } from '@/lib/readPipelineJson';
import type { AssetSignalBundle } from '@/types';

export async function GET() {
  return NextResponse.json(readPipelineJson<AssetSignalBundle>('assets.json', mockAssets));
}
