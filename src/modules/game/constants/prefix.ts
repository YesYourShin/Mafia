import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

const gamePrefixDayFormat = `game:${dayjs(Date.now()).format('YYYYMMDD')}`;

interface Prefix {
  gameInfo: string;
  gameMembers: string;
  gameNumber: string;
}

export const GamePrefix: Prefix = {
  gameInfo: `${gamePrefixDayFormat}:info#`,
  gameMembers: `${gamePrefixDayFormat}:users#`,
  gameNumber: gamePrefixDayFormat,
};
