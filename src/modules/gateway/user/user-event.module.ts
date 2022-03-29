import { Logger, Module } from '@nestjs/common';
import { RedisModule } from 'src/modules/redis/redis.module';
import { UserGateway } from './user.gateway';

@Module({
  imports: [RedisModule],
  providers: [UserGateway, Logger],
  exports: [UserGateway],
})
export class UserEventModule {}
