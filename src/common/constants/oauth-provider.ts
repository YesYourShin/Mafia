import passport from 'passport';
import { UserProvider } from 'src/common/constants';

export interface OauthProfile extends passport.Profile {
  id: string;
  provider: UserProvider;
}
