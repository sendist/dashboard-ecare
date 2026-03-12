import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../common/guard/jwt-auth.guard';
import type { Queue } from 'bullmq';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const RAW_OMNIX_QUEUE = 'raw-omnix-upload';
const UPLOAD_DIR = path.join(process.cwd(), 'tmp', 'raw-omnix');

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function safeFilename(originalName: string) {
  const ext = path.extname(originalName) || '.xlsx';
  const id = crypto.randomBytes(8).toString('hex');
  return `${Date.now()}-${id}${ext}`;
}

@Controller('api/raw-omnix')
export class RawOmnixController {
  constructor(@InjectQueue(RAW_OMNIX_QUEUE) private readonly queue: Queue) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensureUploadDir();
          cb(null, UPLOAD_DIR);
        },
        filename: (_req, file, cb) => cb(null, safeFilename(file.originalname)),
      }),
      limits: { fileSize: 200 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ok =
          file.mimetype ===
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.mimetype === 'application/vnd.ms-excel' ||
          file.originalname.toLowerCase().endsWith('.xlsx') ||
          file.originalname.toLowerCase().endsWith('.xls');
        if (!ok) {
          return cb(
            new BadRequestException('Only Excel files are allowed'),
            false,
          );
        }
        return cb(null, true);
      },
    }),
  )
  async uploadRawOmnix(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    const job = await this.queue.add(
      'upload-omnix',
      { filePath: file.path, originalName: file.originalname },
      { removeOnComplete: 10, removeOnFail: 100 },
    );
    return { jobId: job.id };
  }

  @UseGuards(JwtAuthGuard)
  @Get('jobs/:id')
  async getJobStatus(@Param('id') id: string) {
    const job = await this.queue.getJob(id);
    if (!job) throw new NotFoundException('Job not found');

    const state = await job.getState();

    const formatDate = (value?: number | null) =>
      value ? new Date(value).toISOString() : null;

    const result: Record<string, unknown> = {
      id: job.id,
      name: job.name,
      state,
      progress: job.progress,
      attemptsMade: job.attemptsMade,
      timestamp: formatDate(job.timestamp),
      processedOn: formatDate(job.processedOn),
      finishedOn: formatDate(job.finishedOn),
    };

    if (state === 'failed') {
      result.failedReason = job.failedReason;
    }

    if (state === 'completed') {
      result.returnValue = job.returnvalue;
    }

    return result;
  }
}
