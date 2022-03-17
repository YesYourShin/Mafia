import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

const gamePrefixDayFormat = `game:${dayjs(Date.now()).format('YYYYMMDD')}`;

interface Prefix {
  gameRoomInfo: string;
  gameRoomMembers: string;
  gameRoomNumber: string;
}

export const GamePrefix: Prefix = {
  gameRoomInfo: `${gamePrefixDayFormat}:info#`,
  gameRoomMembers: `${gamePrefixDayFormat}:users#`,
  gameRoomNumber: gamePrefixDayFormat,
};
