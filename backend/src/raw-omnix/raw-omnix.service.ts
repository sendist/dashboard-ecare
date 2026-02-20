import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import * as xlsx from 'xlsx';
import * as fs from 'fs/promises';

const VALID_MAIN_CATEGORIES = new Set([
  'BYU',
  'INDIHOME',
  'TELKOMSEL',
  'DIGIPOS',
]);

/** Extra DB columns that are computed, not from the Excel file.
 *  Key = DB column name, Value = Prisma field name */
const COMPUTED_COLUMNS: Record<string, string> = {
  segment: 'segment',
  tambahan: 'tambahan',
  case_in: 'caseIn',
  case_handle: 'caseHandle',
};

const COLUMN_MAP: Record<string, keyof Prisma.RawOmnixUncheckedCreateInput> = {
  ticket_id: 'ticketId',
  remark: 'remark',
  subject: 'subject',
  priority_id: 'priorityId',
  priority_name: 'priorityName',
  ticket_status_id: 'ticketStatusId',
  ticket_status_name: 'ticketStatusName',
  unit_id: 'unitId',
  unit_name: 'unitName',
  informant_id: 'informantId',
  informant_hp: 'informantHp',
  informant_email: 'informantEmail',
  customer_id: 'customerId',
  customer_hp: 'customerHp',
  customer_email: 'customerEmail',
  date_origin_interaction: 'dateOriginInteraction',
  date_start_interaction: 'dateStartInteraction',
  date_open: 'dateOpen',
  date_close: 'dateClose',
  date_last_update: 'dateLastUpdate',
  is_escalated: 'isEscalated',
  created_by_id: 'createdById',
  created_by_name: 'createdByName',
  updated_by_id: 'updatedById',
  updated_by_name: 'updatedByName',
  channel_id: 'channelId',
  session_id: 'sessionId',
  category_id: 'categoryId',
  category_name: 'categoryName',
  date_created_at: 'dateCreatedAt',
  sla: 'sla',
  channel_name: 'channelName',
  mainCategory: 'mainCategory',
  category: 'category',
  subCategory: 'subCategory',
  detailSubCategory: 'detailSubCategory',
  detailSubCategory2: 'detailSubCategory2',
  date_pickup_interaction: 'datePickupInteraction',
  date_end_interaction: 'dateEndInteraction',
  date_first_pickup_interaction: 'dateFirstPickupInteraction',
  date_first_response_interaction: 'dateFirstResponseInteraction',
  account: 'account',
  account_name: 'accountName',
  informant_member_id: 'informantMemberId',
  customer_member_id: 'customerMemberId',
  sentiment_incoming: 'sentimentIncoming',
  sentiment_outgoing: 'sentimentOutgoing',
  sentiment_all: 'sentimentAll',
  feedback: 'feedback',
  sentiment_service: 'sentimentService',
  parent_id: 'parentId',
  count_merged: 'countMerged',
  source_id: 'sourceId',
  source_name: 'sourceName',
  contact: 'contact',
  interaction_additional_info: 'interactionAdditionalInfo',
  informant_name: 'informantName',
  customer_name: 'customerName',
  survey_name: 'surveyName',
  survey_id: 'surveyId',
  respondent_id: 'respondentId',
  ticket_id_old: 'ticketIdOld',
  waitingTime: 'waitingTime',
  serviceTime: 'serviceTime',
  responseTime: 'responseTime',
  handlingTime: 'handlingTime',
  duration: 'duration',
  acw: 'acw',
  ticket_Edukasi_NPS: 'ticketEdukasiNps',
  ticket_Escalated_Ticket: 'ticketEscalatedTicket',
  customer_twitter_id: 'customerTwitterId',
  customer_phone: 'customerPhone',
  sla_second: 'slaSecond',
  ticketId_masking: 'ticketIdMasking',
  date_in_progress: 'dateInProgress',
  date_pending: 'datePending',
  date_completed: 'dateCompleted',
  date_reopen: 'dateReopen',
  date_resolved: 'dateResolved',
  date_closed: 'dateClosed',
  customer_instagram_id: 'customerInstagramId',
  customer_livechat_id: 'customerLivechatId',
  customer_facebook_id: 'customerFacebookId',
  customer_playstore_id: 'customerPlaystoreId',
  customer_msisdn: 'customerMsisdn',
  customer_indihome_number: 'customerIndihomeNumber',
};

const DATE_FIELDS = new Set<keyof Prisma.RawOmnixUncheckedCreateInput>([
  'dateOriginInteraction',
  'dateStartInteraction',
  'dateOpen',
  'dateClose',
  'dateLastUpdate',
  'dateCreatedAt',
  'datePickupInteraction',
  'dateEndInteraction',
  'dateFirstPickupInteraction',
  'dateFirstResponseInteraction',
  'dateInProgress',
  'datePending',
  'dateCompleted',
  'dateReopen',
  'dateResolved',
  'dateClosed',
]);

@Injectable()
export class RawOmnixService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger(RawOmnixService.name);

  async upsertFromExcel(fileBuffer: Buffer) {
    this.logger.log('Starting Raw Omnix upsert from Excel file');
    const workbook = xlsx.read(fileBuffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new BadRequestException('No sheets found in file');

    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: null,
      raw: true,
    });

    if (rows.length === 0) {
      throw new BadRequestException('Excel file has no data rows');
    }

    // Preload lookup table into a Map keyed by accountSourceName
    const lookups = await this.prisma.lookupSegment.findMany();
    const lookupMap = new Map<
      string,
      { segment: string | null; tambahan: string | null }
    >();
    for (const l of lookups) {
      if (l.accountSourceName) {
        lookupMap.set(l.accountSourceName, {
          segment: l.segment,
          tambahan: l.tambahan,
        });
      }
    }
    this.logger.log(`Loaded ${lookupMap.size} lookup segment entries`);

    const mapped = rows
      .map((row) => this.mapRow(row, lookupMap))
      .filter((row): row is Prisma.RawOmnixUncheckedCreateInput => !!row);

    if (mapped.length === 0) {
      throw new BadRequestException('No valid rows found (missing ticket_id)');
    }

    // const columnsCount = Object.keys(COLUMN_MAP).length;
    // const maxParams = 60000;
    // const batchSize = Math.max(1, Math.floor(maxParams / columnsCount));
    const batchSize = 500;
    for (let i = 0; i < mapped.length; i += batchSize) {
      this.logger.log(
        `Upserting batch ${i / batchSize + 1} (rows ${i} to ${Math.min(
          i + batchSize - 1,
          mapped.length - 1,
        )})`,
      );
      const batch = mapped.slice(i, i + batchSize);
      await this.upsertBatchRaw(batch);
    }

    this.logger.log('Raw Omnix upsert from Excel file completed');
    return {
      processed: rows.length,
      upserted: mapped.length,
      skipped: rows.length - mapped.length,
    };
  }

  async upsertFromExcelFile(filePath: string) {
    this.logger.log('Starting Raw Omnix upsert from file (streamed)');

    // Preload lookup table
    const lookups = await this.prisma.lookupSegment.findMany();
    const lookupMap = new Map<
      string,
      { segment: string | null; tambahan: string | null }
    >();
    for (const l of lookups) {
      if (l.accountSourceName) {
        lookupMap.set(this.normalizeKey(l.accountSourceName), {
          segment: l.segment,
          tambahan: l.tambahan,
        });
      }
    }
    this.logger.log(`Loaded ${lookupMap.size} lookup segment entries`);

    // Read workbook from file (not buffer) to avoid doubling memory
    const workbook = xlsx.readFile(filePath, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new BadRequestException('No sheets found in file');

    const sheet = workbook.Sheets[sheetName];
    const ref = sheet['!ref'];
    if (!ref) throw new BadRequestException('Excel sheet is empty');

    const range = xlsx.utils.decode_range(ref);
    const totalRows = range.e.r; // 0-indexed last row (row 0 = header)

    if (totalRows < 1) {
      throw new BadRequestException('Excel file has no data rows');
    }

    // Extract headers from row 0
    const headers: string[] = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = xlsx.utils.encode_cell({ r: 0, c: col });
      const cell = sheet[cellRef];
      headers[col] = cell ? String(cell.v) : '';
    }

    const CHUNK_SIZE = 500;
    let processed = 0;
    let upserted = 0;
    let skipped = 0;
    let batchNum = 0;

    for (let startRow = 1; startRow <= totalRows; startRow += CHUNK_SIZE) {
      const endRow = Math.min(startRow + CHUNK_SIZE - 1, totalRows);
      batchNum++;

      // Parse only this chunk of rows from the sheet
      const chunkRows: Record<string, unknown>[] = [];
      for (let r = startRow; r <= endRow; r++) {
        const row: Record<string, unknown> = {};
        for (let c = range.s.c; c <= range.e.c; c++) {
          const header = headers[c];
          if (!header) continue;
          const cellRef = xlsx.utils.encode_cell({ r, c });
          const cell = sheet[cellRef];
          row[header] = cell ? cell.v : null;
        }
        chunkRows.push(row);
      }

      const mapped = chunkRows
        .map((row) => this.mapRow(row, lookupMap))
        .filter((row): row is Prisma.RawOmnixUncheckedCreateInput => !!row);

      processed += chunkRows.length;
      skipped += chunkRows.length - mapped.length;

      if (mapped.length > 0) {
        this.logger.log(
          `Upserting batch ${batchNum} (rows ${startRow} to ${endRow}, ` +
            `${mapped.length} valid)`,
        );
        await this.upsertBatchRaw(mapped);
        upserted += mapped.length;
      }
    }

    // Clean up temp file
    await fs.unlink(filePath).catch(() => undefined);

    this.logger.log('Raw Omnix upsert completed');
    return { processed, upserted, skipped };
  }

  /**
   * @deprecated Use upsertFromExcelFile for large files (memory-safe).
   * Kept for backward compatibility / small buffer uploads.
   */

  private mapRow(
    row: Record<string, unknown>,
    lookupMap: Map<string, { segment: string | null; tambahan: string | null }>,
  ) {
    const data: Record<string, unknown> = {};

    for (const [column, field] of Object.entries(COLUMN_MAP)) {
      const rawValue = row[column];
      const value = this.normalizeValue(rawValue);
      if (DATE_FIELDS.has(field as any)) {
        data[field] = this.parseDate(value);
      } else {
        data[field] = value;
      }
    }

    if (!data.ticketId) return null;

    // --- Computed: segment & tambahan via LookupSegment ---
    const account = (data.account as string) ?? '';
    const sourceName = (data.sourceName as string) ?? '';
    const accountSourceKey = this.normalizeKey(`${account}_${sourceName}`);
    const lookup = lookupMap.get(accountSourceKey);
    data.segment = lookup?.segment ?? null;
    data.tambahan = lookup?.tambahan ?? null;
    if (!data.segment || !data.tambahan) {
      this.logger.warn(
        `No lookup match for account "${account}" and sourceName "${sourceName}" ` +
          `(key: "${accountSourceKey}")`,
      );
    }

    // --- Computed: caseIn ---
    // 1 if session_id is present and non-empty, else 0
    const sessionId = data.sessionId as string | null;
    data.caseIn = sessionId && sessionId.trim() !== '' ? 1 : 0;

    // --- Computed: caseHandle ---
    // 0 if ticket_id is null/empty; otherwise 1 only if mainCategory is one of the valid set
    const ticketId = data.ticketId as string;
    if (!ticketId || ticketId.trim() === '') {
      data.caseHandle = 0;
    } else {
      const mainCat = ((data.mainCategory as string) ?? '')
        .toUpperCase()
        .trim();
      data.caseHandle = VALID_MAIN_CATEGORIES.has(mainCat) ? 1 : 0;
    }

    return data as unknown as Prisma.RawOmnixUncheckedCreateInput;
  }

  private normalizeKey(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, '_');
  }

  private normalizeValue(value: unknown) {
    if (value === null || value === undefined) return null;
    if (value === '-') return null;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length === 0 ? null : trimmed;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (value instanceof Date) return value;
    return String(value);
  }

  private parseDate(value: unknown) {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value !== 'string') return null;

    const match = value.match(
      /^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
    );
    if (!match) return null;

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const hour = Number(match[4] ?? 0);
    const minute = Number(match[5] ?? 0);
    const second = Number(match[6] ?? 0);

    const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    return isNaN(date.getTime()) ? null : date;
  }

  private async upsertBatchRaw(batch: Prisma.RawOmnixUncheckedCreateInput[]) {
    const allColumns = {
      ...COLUMN_MAP,
      ...COMPUTED_COLUMNS,
    };
    const columns = Object.keys(allColumns);
    const columnSql = columns.map((column) => `"${column}"`).join(', ');

    const values: unknown[] = [];
    const rowsSql = batch
      .map((row, rowIndex) => {
        const placeholders = columns.map((column, columnIndex) => {
          const field = allColumns[column];
          values.push((row as any)[field] ?? null);
          const paramIndex = rowIndex * columns.length + columnIndex + 1;
          return `$${paramIndex}`;
        });
        return `(${placeholders.join(', ')})`;
      })
      .join(', ');

    const updateSql = columns
      .filter((column) => column !== 'ticket_id')
      .map((column) => `"${column}" = EXCLUDED."${column}"`)
      .join(', ');

    const sql =
      `INSERT INTO "raw_omnix" (${columnSql}) VALUES ${rowsSql} ` +
      `ON CONFLICT ("ticket_id") DO UPDATE SET ${updateSql}`;

    await this.prisma.$executeRawUnsafe(sql, ...values);
  }
}
