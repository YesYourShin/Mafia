import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

const gamePrefixDayFormat = `game:${dayjs(Date.now()).format('YYYYMMDD')}`;

const Prefix = 'GAME:';

export const Event = {
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
