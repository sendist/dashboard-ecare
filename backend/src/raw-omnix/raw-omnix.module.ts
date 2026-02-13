import { Module } from '@nestjs/common';
import { RawOmnixController } from './raw-omnix.controller';
import { RawOmnixService } from './raw-omnix.service';

@Module({
  controllers: [RawOmnixController],
  providers: [RawOmnixService],
})
export class RawOmnixModule {}
