import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guard/jwt-auth.guard';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * GET /api/analytics/trend?startDate=2026-02-19&endDate=2026-02-20&tambahan=All_Byu&segment=Live_Chat
   *
   * Returns 15-minute bucketed trend of caseIn, caseHandle, avgResponseTime
   * grouped by segment & tambahan.
   *
   * Required: startDate, endDate (ISO date strings)
   * Optional: tambahan, segment
   */
  @UseGuards(JwtAuthGuard)
  @Get('trend')
  async getTrend(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('tambahan') tambahan?: string,
    @Query('segment') segment?: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }
    return this.analyticsService.getTrend({
      startDate,
      endDate,
      tambahan: tambahan || undefined,
      segment: segment || undefined,
    });
  }

  /**
   * GET /api/analytics/summary?startDate=2026-02-19&endDate=2026-02-20
   *
   * Returns aggregated totals grouped by tambahan & segment.
   */
  @UseGuards(JwtAuthGuard)
  @Get('summary')
  async getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('tambahan') tambahan?: string,
    @Query('segment') segment?: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }
    return this.analyticsService.getSummary({
      startDate,
      endDate,
      tambahan: tambahan || undefined,
      segment: segment || undefined,
    });
  }

  /**
   * GET /api/analytics/segments
   *
   * Returns the tambahan → segment[] hierarchy for filter dropdowns.
   */
  @UseGuards(JwtAuthGuard)
  @Get('segments')
  async getSegments() {
    return this.analyticsService.getSegmentHierarchy();
  }
}
