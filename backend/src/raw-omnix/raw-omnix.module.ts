import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { RawOmnixController } from './raw-omnix.controller';
import { RawOmnixService } from './raw-omnix.service';
import { RawOmnixProcessor } from './raw-omnix.processor';

const RAW_OMNIX_QUEUE = 'raw-omnix-upload';

@Module({
  imports: [BullModule.registerQueue({ name: RAW_OMNIX_QUEUE })],
  controllers: [RawOmnixController],
  providers: [RawOmnixService, RawOmnixProcessor],
})
export class RawOmnixModule {}
