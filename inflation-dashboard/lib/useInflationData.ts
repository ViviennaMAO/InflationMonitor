'use client';
import useSWR from 'swr';
import type {
  MarketAnchors,
  InflationScore, ComponentDetail, AssetSignalBundle, ScenarioBundle,
  InflationDiagnosis, FomcBundle, FiscalBundle, NarrativeBundle,
  PriceDecompEntry, ExpectationsBundle, InflationHistoryEntry,
  SignalTimelineEntry, EventWindow,
} from '@/types';
import {
  mockMarketAnchors,
  mockScore, mockComponents, mockAssets, mockScenarios, mockDiagnosis,
  mockFomc, mockFiscal, mockNarrative, mockPriceDecomp, mockExpectations,
  mockHistory, mockSignalTimeline, mockEventWindow,
} from '@/data/mockData';

const fetcher = (url: string) => fetch(url).then(r => r.json());
const REFRESH = 5 * 60 * 1000;

export function useScore() {
  const { data, isLoading } = useSWR<InflationScore>('/api/score', fetcher, { refreshInterval: REFRESH });
  return { data: data ?? mockScore, isLoading };
}

export function useComponents() {
  const { data, isLoading } = useSWR<ComponentDetail[]>('/api/components', fetcher, { refreshInterval: REFRESH });
  return { data: data ?? mockComponents, isLoading };
}

export function useAssets() {
  const { data, isLoading } = useSWR<AssetSignalBundle>('/api/assets', fetcher, { refreshInterval: REFRESH });
  return { data: data ?? mockAssets, isLoading };
}

export function useScenarios() {
  const { data, isLoading } = useSWR<ScenarioBundle>('/api/scenarios', fetcher, { refreshInterval: REFRESH });
  return { data: data ?? mockScenarios, isLoading };
}

export function useDiagnosis() {
  const { data, isLoading } = useSWR<InflationDiagnosis>('/api/diagnosis', fetcher, { refreshInterval: REFRESH });
  return { data: data ?? mockDiagnosis, isLoading };
}

export function useFomc() {
  const { data, isLoading } = useSWR<FomcBundle>('/api/fomc', fetcher, { refreshInterval: REFRESH });
  return { data: data ?? mockFomc, isLoading };
}

export function useFiscal() {
  const { data, isLoading } = useSWR<FiscalBundle>('/api/fiscal', fetcher, { refreshInterval: REFRESH });
  return { data: data ?? mockFiscal, isLoading };
}

export function useNarrative() {
  const { data, isLoading } = useSWR<NarrativeBundle>('/api/narrative', fetcher, { refreshInterval: REFRESH });
  return { data: data ?? mockNarrative, isLoading };
}

export function usePriceDecomp() {
  const { data, isLoading } = useSWR<PriceDecompEntry[]>('/api/prices', fetcher, { refreshInterval: REFRESH });
  return { data: data ?? mockPriceDecomp, isLoading };
}

export function useExpectations() {
  const { data, isLoading } = useSWR<ExpectationsBundle>('/api/expectations', fetcher, { refreshInterval: REFRESH });
  return { data: data ?? mockExpectations, isLoading };
}

export function useHistory() {
  const { data, isLoading } = useSWR<InflationHistoryEntry[]>('/api/history', fetcher, { refreshInterval: REFRESH });
  return { data: data ?? mockHistory, isLoading };
}

export function useSignalTimeline() {
  const { data, isLoading } = useSWR<SignalTimelineEntry[]>('/api/signal-timeline', fetcher, { refreshInterval: REFRESH });
  return { data: data ?? mockSignalTimeline, isLoading };
}

export function useMarketAnchors() {
  const { data, isLoading } = useSWR<MarketAnchors>('/api/market-anchors', fetcher, { refreshInterval: REFRESH });
  return { data: data ?? mockMarketAnchors, isLoading };
}

export function useEventWindow() {
  const { data, isLoading } = useSWR<EventWindow>('/api/event-window', fetcher, { refreshInterval: REFRESH });
  return { data: data ?? mockEventWindow, isLoading };
}
