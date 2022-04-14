import { Exclude, Expose } from 'class-transformer';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { JanusRequestEvent } from '../constants/janus-request-event';

export class JanusRoomListParticipantsDto {
  @IsEnum(JanusRequestEvent)
  @Exclude()
  private readonly _request: JanusRequestEvent.LIST_PARTICIPANTS;

  @IsNumber()
  private readonly _room: number;

  @IsString()
  @Exclude()
  private readonly _admin_key: string;

  constructor(
    request: JanusRequestEvent.LIST_PARTICIPANTS,
    room: number,
    admin_key: string,
  ) {
    this._request = request;
    this._room = room;
    this._admin_key = admin_key;
  }

  @Expose()
  get request(): JanusRequestEvent.LIST_PARTICIPANTS {
    return this._request;
  }

  @Expose()
  get room(): number {
    return this._room;
  }

  @Expose()
  get admin_key(): string {
    return this._admin_key;
  }
}
