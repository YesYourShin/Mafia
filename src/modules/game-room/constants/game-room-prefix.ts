import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

const gamePrefixDayFormat = `game:${dayjs(Date.now()).format('YYYYMMDD')}`;

export const GameRoomPrefix = {
  gameRoomInfo: `${gamePrefixDayFormat}:info#`,
  gameRoomMembers: `${gamePrefixDayFormat}:users#`,
  gameRoomNumber: gamePrefixDayFormat,
};
