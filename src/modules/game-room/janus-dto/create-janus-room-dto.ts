import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { JanusRequestEvent } from '../constants/janus-request-event';
import { CreateGameRoomDto } from '../dto';

export class CreateJanusRoomDto {
  @IsEnum(JanusRequestEvent)
  request: JanusRequestEvent;

  @IsInt()
  publishers: number;

  @IsOptional()
  @IsString()
  pin?: string;

  @IsString()
  description?: string;

  @IsString()
  admin_key: string;

  constructor(createGameDto: CreateGameRoomDto, admin_key: string) {
    this.request = JanusRequestEvent.CREATE;
    this.description = createGameDto.description;
    this.publishers = createGameDto.publishers;
    if (createGameDto?.pin) {
      this.pin = createGameDto.pin;
    }
    this.admin_key = admin_key;
  }
}

// export class CreateJanusRoomDto {
//   @IsEnum(JanusRequestEvent)
//   @Exclude()
//   private readonly _request: JanusRequestEvent;

//   @IsInt()
//   @Exclude()
//   private readonly _publishers: number;

//   @IsOptional()
//   @IsString()
//   @Exclude()
//   private readonly _pin?: string;

//   @IsString()
//   @Exclude()
//   private readonly _description?: string;

//   @IsString()
//   @Exclude()
//   private readonly _admin_key: string;

//   constructor(createGameDto: CreateGameRoomDto, admin_key: string) {
//     this._request = JanusRequestEvent.CREATE;
//     this._description = createGameDto.description;
//     this._publishers = createGameDto.publishers;
//     if (createGameDto?.pin) {
//       this._pin = createGameDto.pin;
//     }
//     this._admin_key = admin_key;
//   }

//   get request(): JanusRequestEvent {
//     return this._request;
//   }

//   get description(): string {
//     return this._description;
//   }

//   get publishers(): number {
//     return this._publishers;
//   }

//   get pin(): string | null {
//     return this?._pin;
//   }

//   get admin_key(): string {
//     return this._admin_key;
//   }
// }
