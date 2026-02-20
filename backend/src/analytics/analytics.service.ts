import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface TrendRow {
  time_bucket: Date;
  segment: string | null;
  tambahan: string | null;
  total_case_in: number;
  total_case_handle: number;
  avg_response_time_seconds: number | null;
}

interface TrendParams {
  startDate: string; // ISO date or datetime
  endDate: string;
  tambahan?: string;
  segment?: string;
}

export interface TrendDataPoint {
  t: string; // ISO timestamp
  caseIn: number;
  caseHandle: number;
  avgRespSec: number | null;
}

export interface TrendSeries {
  tambahan: string;
  segment: string;
  totals: {
    totalCaseIn: number;
    totalCaseHandle: number;
    avgResponseTimeSeconds: number | null;
  };
  data: TrendDataPoint[];
}

export interface TrendResponse {
  meta: {
    startDate: string;
    endDate: string;
    bucketMinutes: number;
    timeBuckets: string[];
  };
  series: TrendSeries[];
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 15-minute interval trend of caseIn, caseHandle, avg response time
   * grouped by segment & tambahan, filtered by date range.
   *
   * Returns a pre-grouped series structure optimised for chart rendering.
   */
  async getTrend(params: TrendParams): Promise<TrendResponse> {
    const { startDate, endDate, tambahan, segment } = params;

    const conditions: string[] = [
      `"date_start_interaction" >= $1`,
      `"date_start_interaction" < $2`,
    ];
    const values: unknown[] = [new Date(startDate), new Date(endDate)];
    let paramIdx = 3;

    if (tambahan) {
      conditions.push(`"tambahan" = $${paramIdx}`);
      values.push(tambahan);
      paramIdx++;
    }

    if (segment) {
      conditions.push(`"segment" = $${paramIdx}`);
      values.push(segment);
      paramIdx++;
    }

    const whereClause = conditions.join(' AND ');

    const sql = `
      SELECT
        date_trunc('hour', "date_start_interaction")
          + (EXTRACT(minute FROM "date_start_interaction")::int / 15) * interval '15 minutes'
          AS time_bucket,
        "segment",
        "tambahan",
        COALESCE(SUM("case_in"), 0)::int AS total_case_in,
        COALESCE(SUM("case_handle"), 0)::int AS total_case_handle,
        AVG(
          CASE
            WHEN "date_first_response_interaction" IS NOT NULL
              AND "date_start_interaction" IS NOT NULL
            THEN EXTRACT(EPOCH FROM ("date_first_response_interaction" - "date_start_interaction"))
            ELSE NULL
          END
        ) AS avg_response_time_seconds
      FROM "raw_omnix"
      WHERE ${whereClause}
      GROUP BY time_bucket, "segment", "tambahan"
      ORDER BY time_bucket ASC, "tambahan" ASC, "segment" ASC
    `;

    const rows: TrendRow[] = await this.prisma.$queryRawUnsafe(sql, ...values);

    // --- Build unique sorted time buckets (shared x-axis) ---
    const timeBucketSet = new Set<string>();
    for (const row of rows) {
      timeBucketSet.add(new Date(row.time_bucket).toISOString());
    }
    const timeBuckets = Array.from(timeBucketSet).sort();

    // --- Group rows into series keyed by "tambahan|segment" ---
    const seriesMap = new Map<
      string,
      {
        tambahan: string;
        segment: string;
        totalCaseIn: number;
        totalCaseHandle: number;
        respTimeSum: number;
        respTimeCount: number;
        data: TrendDataPoint[];
      }
    >();

    for (const row of rows) {
      const key = `${row.tambahan ?? 'unknown'}|${row.segment ?? 'unknown'}`;
      if (!seriesMap.has(key)) {
        seriesMap.set(key, {
          tambahan: row.tambahan ?? 'unknown',
          segment: row.segment ?? 'unknown',
          totalCaseIn: 0,
          totalCaseHandle: 0,
          respTimeSum: 0,
          respTimeCount: 0,
          data: [],
        });
      }

      const entry = seriesMap.get(key)!;
      const caseIn = Number(row.total_case_in);
      const caseHandle = Number(row.total_case_handle);
      const avgRespSec = row.avg_response_time_seconds
        ? Math.round(Number(row.avg_response_time_seconds))
        : null;

      entry.totalCaseIn += caseIn;
      entry.totalCaseHandle += caseHandle;
      if (avgRespSec !== null) {
        entry.respTimeSum += Number(row.avg_response_time_seconds);
        entry.respTimeCount += 1;
      }

      entry.data.push({
        t: new Date(row.time_bucket).toISOString(),
        caseIn,
        caseHandle,
        avgRespSec,
      });
    }

    // --- Assemble final series array ---
    const series: TrendSeries[] = Array.from(seriesMap.values()).map((s) => ({
      tambahan: s.tambahan,
      segment: s.segment,
      totals: {
        totalCaseIn: s.totalCaseIn,
        totalCaseHandle: s.totalCaseHandle,
        avgResponseTimeSeconds:
          s.respTimeCount > 0
            ? Math.round(s.respTimeSum / s.respTimeCount)
            : null,
      },
      data: s.data,
    }));

    return {
      meta: {
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        bucketMinutes: 15,
        timeBuckets,
      },
      series,
    };
  }

  /**
   * Summary totals for the given date range, grouped by tambahan + segment.
   */
  async getSummary(params: TrendParams) {
    const { startDate, endDate, tambahan, segment } = params;

    const conditions: string[] = [
      `"date_start_interaction" >= $1`,
      `"date_start_interaction" < $2`,
    ];
    const values: unknown[] = [new Date(startDate), new Date(endDate)];
    let paramIdx = 3;

    if (tambahan) {
      conditions.push(`"tambahan" = $${paramIdx}`);
      values.push(tambahan);
      paramIdx++;
    }

    if (segment) {
      conditions.push(`"segment" = $${paramIdx}`);
      values.push(segment);
      paramIdx++;
    }

    const whereClause = conditions.join(' AND ');

    const sql = `
      SELECT
        "tambahan",
        "segment",
        COALESCE(SUM("case_in"), 0)::int AS total_case_in,
        COALESCE(SUM("case_handle"), 0)::int AS total_case_handle,
        AVG(
          CASE
            WHEN "date_first_response_interaction" IS NOT NULL
              AND "date_start_interaction" IS NOT NULL
            THEN EXTRACT(EPOCH FROM ("date_first_response_interaction" - "date_start_interaction"))
            ELSE NULL
          END
        ) AS avg_response_time_seconds,
        COUNT(*)::int AS total_rows
      FROM "raw_omnix"
      WHERE ${whereClause}
      GROUP BY "tambahan", "segment"
      ORDER BY "tambahan" ASC, "segment" ASC
    `;

    const rows = await this.prisma.$queryRawUnsafe<any[]>(sql, ...values);

    return rows.map((row) => ({
      tambahan: row.tambahan,
      segment: row.segment,
      totalCaseIn: Number(row.total_case_in),
      totalCaseHandle: Number(row.total_case_handle),
      avgResponseTimeSeconds: row.avg_response_time_seconds
        ? Math.round(Number(row.avg_response_time_seconds))
        : null,
      totalRows: Number(row.total_rows),
    }));
  }

  /**
   * Returns the hierarchy of tambahan → segment[] from LookupSegment.
   */
  async getSegmentHierarchy() {
    const lookups = await this.prisma.lookupSegment.findMany({
      select: { segment: true, tambahan: true },
      distinct: ['segment', 'tambahan'],
      orderBy: [{ tambahan: 'asc' }, { segment: 'asc' }],
    });

    const hierarchy: Record<string, string[]> = {};
    for (const l of lookups) {
      const key = l.tambahan ?? 'unknown';
      if (!hierarchy[key]) hierarchy[key] = [];
      if (l.segment && !hierarchy[key].includes(l.segment)) {
        hierarchy[key].push(l.segment);
      }
    }

    return hierarchy;
  }
}
