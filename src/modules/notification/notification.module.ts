import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationRepository } from './notification.repository';
import { NotificationController } from './notification.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationRepository])],
  controllers: [NotificationController],
  providers: [NotificationService, ConfigService],
  exports: [NotificationService],
})
export class NotificationModule {}
