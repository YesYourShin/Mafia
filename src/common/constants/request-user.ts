import { Request } from 'express';
import { UserProfile } from 'src/modules/user/dto';

export interface RequestUser extends Request {
  user: UserProfile;
}
