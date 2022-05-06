import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEventModule } from '../gateway/user/user-event.module';
import { NotificationModule } from '../notification/notification.module';
import { RedisModule } from '../redis/redis.module';
import { DMController } from './dm.controller';
import { DMRepository } from './dm.repository';
import { DMService } from './dm.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DMRepository]),
    UserEventModule,
    NotificationModule,
    RedisModule,
  ],
  controllers: [DMController],
  providers: [DMService, ConfigService],
})
export class DMModule {}
