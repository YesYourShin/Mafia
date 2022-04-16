import { IsEnum, IsNumber } from 'class-validator';
import { JanusRequestEvent } from '../constants/janus-request-event';

export class DestroyJanusRoomDto {
  @IsEnum(JanusRequestEvent)
  request: JanusRequestEvent;

  @IsNumber()
  room: number;

  constructor(room: number) {
    this.request = JanusRequestEvent.DESTROY;
    this.room = room;
  }
}
// export class DestroyJanusRoomDto {
//   @IsEnum(JanusRequestEvent)
//   _request: JanusRequestEvent;

//   @IsNumber()
//   _room: number;

//   constructor(room: number) {
//     this._request = JanusRequestEvent.DESTROY;
//     this._room = room;
//   }

//   @Expose()
//   get request(): JanusRequestEvent {
//     return this._request;
//   }

//   @Expose()
//   get room(): number {
//     return this._room;
//   }
// }

// {
//         "request" : "destroy",
//         "room" : <unique numeric ID of the room to destroy>,
//         "secret" : "<room secret, mandatory if configured>",
//         "permanent" : <true|false, whether the room should be also removed from the config file, default=false>
// }
