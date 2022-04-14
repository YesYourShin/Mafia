import { Exclude, Expose } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { JanusRequestEvent } from '../constants/janus-request-event';
import { CreateGameRoomDto } from '../dto';

export class CreateJanusRoomDto {
  @IsEnum(JanusRequestEvent)
  @Exclude()
  private readonly _request: JanusRequestEvent;

  @IsInt()
  @Exclude()
  private readonly _publishers: number;

  @IsOptional()
  @IsString()
  @Exclude()
  private readonly _pin?: string | null;

  @IsString()
  @Exclude()
  private readonly _description?: string;

  @IsString()
  @Exclude()
  private readonly _admin_key: string;

  constructor(createGameDto: CreateGameRoomDto, admin_key: string) {
    this._request = JanusRequestEvent.CREATE;
    this._description = createGameDto.description;
    this._publishers = createGameDto.publishers;
    this._pin = createGameDto?.pin;
    this._admin_key = admin_key;
  }

  @Expose()
  get request(): JanusRequestEvent {
    return this._request;
  }

  @Expose()
  get description(): string {
    return this._description;
  }

  @Expose()
  get publishers(): number {
    return this._publishers;
  }

  @Expose()
  get pin(): string | null {
    return this._pin;
  }

  @Expose()
  get admin_key(): string {
    return this._admin_key;
  }
}
