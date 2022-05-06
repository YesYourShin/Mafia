import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { EnumStatus } from 'src/common/constants/enum-status';
import { RequestFriendRequestDto } from '../dto/request-friend-request-dto';

@Injectable()
export class FriendRequestActionValidationPipe implements PipeTransform {
  transform(value: RequestFriendRequestDto, metadata: ArgumentMetadata) {
    const { requestAction } = value;
    if (!metadata || !this.toValidate(requestAction))
      throw new BadRequestException('잘못된 친구 요청 액션 입니다.');

    return value;
  }

  toValidate(requestAction: EnumStatus) {
    console.log(requestAction);
    if (
      requestAction === EnumStatus.ACCEPT ||
      requestAction === EnumStatus.REJECT
    ) {
      return true;
    }
    return false;
  }
}
