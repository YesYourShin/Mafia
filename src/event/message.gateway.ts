import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessageGateway {
  @WebSocketServer()
  server: Server;
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}

// @WebSocketGateway({
//   cors: {
//     origin: '*',
//   },
// })
// export class EventsGateway {
//   @WebSocketServer()
//   server: Server;

//   @SubscribeMessage('events')
//   findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
//     return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
//   }

//   @SubscribeMessage('identity')
//   async identity(@MessageBody() data: number): Promise<number> {
//     return data;
//   }
// }
