import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

const gamePrefixDayFormat = `game:${dayjs(Date.now()).format('YYYYMMDD')}`;

const Prefix = 'game:';

export const Event = {
  CREATE: `${Prefix}create`,
  UPDATE: `${Prefix}update`,
  JOIN: `${Prefix}join`,
  START: `${Prefix}start`,
  LEAVE: `${Prefix}leave`,
  MESSAGE: `${Prefix}message`,
  SERVER_MESSAGE: `${Prefix}serverMessage`,
  ONLINELIST: `${Prefix}onlineList`,
  READY: `${Prefix}ready`,
  UNREADY: `${Prefix}unready`,
};
