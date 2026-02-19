import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { RawOmnixService } from './raw-omnix.service';

const RAW_OMNIX_QUEUE = 'raw-omnix-upload';
const CONCURRENCY = Number(process.env.RAW_OMNIX_CONCURRENCY || 4);

@Processor(RAW_OMNIX_QUEUE, { concurrency: CONCURRENCY })
export class RawOmnixProcessor extends WorkerHost {
  constructor(private readonly rawOmnixService: RawOmnixService) {
    super();
  }

  async process(job: Job<{ filePath: string }>) {
    switch (job.name) {
      case 'upload-omnix':
        return this.rawOmnixService.upsertFromExcelFile(job.data.filePath);

      default:
        return;
    }
  }
}
