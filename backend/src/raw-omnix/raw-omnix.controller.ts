import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { RawOmnixService } from './raw-omnix.service';
import { JwtAuthGuard } from '../common/guard/jwt-auth.guard';

@Controller('api/raw-omnix')
export class RawOmnixController {
  constructor(private readonly rawOmnixService: RawOmnixService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 100 * 1024 * 1024 },
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
    return this.rawOmnixService.upsertFromExcel(file.buffer);
  }
}
