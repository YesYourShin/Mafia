import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

const dayFormat = dayjs(Date.now()).format('YYYYMMDD');

export const GAME = 'GAME';
export const GAME_ROOM_INFO = `INFO:${dayFormat}#`;
export const GAME_ROOM_MEMBERS = `MEMBERS:${dayFormat}#`;
export const GAME_ROOM_READY_MEMBERS = `READY_MEMBER:${dayFormat}#`;
export const GAME_ROOM_NUMBER = `ROOM_NUMBER:${dayFormat}`;
