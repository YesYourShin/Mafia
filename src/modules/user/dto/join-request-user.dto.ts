import { UserProvider } from 'src/constants';

export class JoinRequestUserDto {
  memberShipCode: string;
  provider: UserProvider;
}
