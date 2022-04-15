import { IncomingMessage } from 'http';
import { Socket } from 'socket.io';
import { UserProfile } from 'src/modules/user/dto';

interface AuthenticatedIncomingMessage extends IncomingMessage {
  user?: UserProfile;
}

export interface AuthenticatedSocket extends Socket {
  request: AuthenticatedIncomingMessage;
  data: { roomId?: number };
}
