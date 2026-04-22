import { NextResponse } from 'next/server';
import { mockMarketAnchors } from '@/data/mockData';
import { readPipelineJson } from '@/lib/readPipelineJson';
import type { MarketAnchors } from '@/types';

export async function GET() {
  return NextResponse.json(readPipelineJson<MarketAnchors>('market_anchors.json', mockMarketAnchors));
}
