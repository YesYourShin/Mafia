import { Module } from '@nestjs/common';
import { MessageGateway } from 'src/event/message.gateway';

@Module({
  providers: [MessageGateway],
})
export class MessageModule {}
