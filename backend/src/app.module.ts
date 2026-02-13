import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RawOmnixModule } from './raw-omnix/raw-omnix.module';

@Module({
  imports: [AuthModule, RawOmnixModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
