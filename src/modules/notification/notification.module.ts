import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationRepository } from './notification.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationRepository])],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
