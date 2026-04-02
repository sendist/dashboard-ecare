import { useQuery } from "@tanstack/react-query"

interface TrendDataPoint {
  t: string
  caseIn: number
  caseHandle: number
  avgRespSec: number | null
}

interface TrendSeries {
  tambahan: string
  segment: string
  data: TrendDataPoint[]
}

export interface TrendResponse {
  meta: {
    startDate: string
    endDate: string
    bucketMinutes: number
    timeBuckets: string[]
  }
  series: TrendSeries[]
}

interface UseTrendDataParams {
  startDate: string
  endDate: string
}

function toExclusiveEndDate(endDate: string): string {
  const end = new Date(`${endDate}T00:00:00`)
  end.setDate(end.getDate() + 1)
  return end.toISOString().split("T")[0]
}

async function fetchTrendData({ startDate, endDate }: UseTrendDataParams): Promise<TrendResponse> {
  const endDateExclusive = toExclusiveEndDate(endDate)

  const params = new URLSearchParams({
    startDate,
    endDate: endDateExclusive,
  })

  const response = await fetch(`/api/analytics/trend?${params}`, {
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch trend data (${response.status})`)
  }

  return response.json()
}

export function useTrendData({ startDate, endDate }: UseTrendDataParams) {
  const query = useQuery({
    queryKey: ["analytics", "trend", startDate, endDate],
    queryFn: () => fetchTrendData({ startDate, endDate }),
    enabled: Boolean(startDate && endDate),
  })

  return {
    trendData: query.data ?? null,
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : null,
  }
}