const Prefix = 'GAME:';

export const GameRoomEvent = {
  CREATE: `${Prefix}CREATE`,
  UPDATE: `${Prefix}UPDATE`,
  JOIN: `${Prefix}JOIN`,
  LEAVE: `${Prefix}LEAVE`,
  MESSAGE: `${Prefix}MESSAGE`,
  SERVER_MESSAGE: `${Prefix}MESSAGE`,
  ONLINELIST: `${Prefix}ONLINELIST`,
  START: `${Prefix}START`,
  READY: `${Prefix}READY`,
  UNREADY: `${Prefix}UNREADY`,
};
