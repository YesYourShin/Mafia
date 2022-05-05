import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEventModule } from '../gateway/user/user-event.module';
import { DMController } from './dm.controller';
import { DMRepository } from './dm.repository';
import { DMService } from './dm.service';

@Module({
  imports: [TypeOrmModule.forFeature([DMRepository]), UserEventModule],
  controllers: [DMController],
  providers: [DMService, ConfigService],
})
export class DMModule {}
