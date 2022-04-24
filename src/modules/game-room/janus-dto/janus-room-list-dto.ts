import { IsEnum } from 'class-validator';
import { JanusRequestEvent } from '../constants/janus-request-event';

export class JanusRoomListDto {
  @IsEnum(JanusRequestEvent)
  request: JanusRequestEvent.LIST;

  constructor(request: JanusRequestEvent.LIST) {
    this.request = request;
  }
}
