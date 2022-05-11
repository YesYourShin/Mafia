import { Logger, Module } from '@nestjs/common';
import { RedisModule } from 'src/modules/redis/redis.module';
import { UserEventService } from './user-event.service';
import { UserGateway } from './user.gateway';

@Module({
  imports: [RedisModule],
  providers: [UserGateway, Logger, UserEventService],
  exports: [UserGateway],
})
export class UserEventModule {}
