import { Exclude, Expose } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { JanusRequestEvent } from '../constants/janus-request-event';

export class JanusRoomListDto {
  @IsEnum(JanusRequestEvent)
  @Exclude()
  private readonly _request: JanusRequestEvent.LIST;

  constructor(request: JanusRequestEvent.LIST) {
    this._request = request;
  }

  @Expose()
  get request(): JanusRequestEvent.LIST {
    return this._request;
  }
}
