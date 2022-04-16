import { Exclude, Expose } from 'class-transformer';
import { CreateJanusRoomDto } from './create-janus-room-dto';
import { DestroyJanusRoomDto } from './destroy-janus-room-dto';
import { JanusRoomListDto } from './janus-room-list-dto';
import { JanusRoomListParticipantsDto } from './janus-room-list-participants-dto';
import { KickJanusRoomDto } from './kick-janus-room-dto';

export type JanusRequest =
  | CreateJanusRoomDto
  | DestroyJanusRoomDto
  | KickJanusRoomDto
  | JanusRoomListParticipantsDto
  | JanusRoomListDto;

export class JanusRequestDto {
  janus: string;
  plugin: string;
  transaction: string;
  admin_secret: string;
  request: JanusRequest;

  constructor(
    transaction: string,
    admin_secret: string,
    request: JanusRequest,
  ) {
    this.janus = 'message_plugin';
    this.plugin = 'janus.plugin.videoroom';
    this.transaction = transaction;
    this.admin_secret = admin_secret;
    this.request = request;
  }
}

// export class JanusRequestDto {
//   @Exclude() private readonly _janus: string;
//   @Exclude() private readonly _plugin: string;
//   @Exclude() private readonly _transaction: string;
//   @Exclude() private readonly _admin_secret: string;
//   @Exclude() private readonly _request: JanusRequest;

//   constructor(
//     transaction: string,
//     admin_secret: string,
//     request: JanusRequest,
//   ) {
//     this._janus = 'message_plugin';
//     this._plugin = 'janus.plugin.videoroom';
//     this._transaction = transaction;
//     this._admin_secret = admin_secret;
//     this._request = request;
//   }

//   @Expose()
//   get janus(): string {
//     return this._janus;
//   }

//   @Expose()
//   get plugin(): string {
//     return this._plugin;
//   }

//   @Expose()
//   get transaction(): string {
//     return this._transaction;
//   }

//   @Expose()
//   get admin_secret(): string {
//     return this._admin_secret;
//   }

//   @Expose()
//   get request(): JanusRequest {
//     return this._request;
//   }
// }
