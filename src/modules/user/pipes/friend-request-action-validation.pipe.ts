import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { EnumStatus } from 'src/common/constants/enum-status';

@Injectable()
export class FriendRequestActionValidationPipe implements PipeTransform {
  transform(value: EnumStatus, metadata: ArgumentMetadata) {
    if (!metadata || !this.toValidate(value))
      throw new BadRequestException('잘못된 친구 요청 액션 입니다.');

    return value;
  }

  toValidate(value: EnumStatus) {
    if (value === EnumStatus.ACCEPT || value === EnumStatus.REJECT) {
      return true;
    }
    return false;
  }
}
