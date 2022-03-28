import { Logger, Module } from '@nestjs/common';
import { RedisModules } from 'src/modules/redis/redis.modules';
import { UserGateway } from './user.gateway';

@Module({
  imports: [RedisModules],
  providers: [UserGateway, Logger],
  exports: [UserGateway],
})
export class UserEventModule {}
