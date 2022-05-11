import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { removeNilFromObject } from 'src/common/constants';
import { ReadNotificationDto } from '../dto/read-notification.dto';

@Injectable()
export class ExistUuidValidationPipe implements PipeTransform {
  transform(value: ReadNotificationDto, metadata: ArgumentMetadata) {
    if (!metadata || !this.toValidate(value))
      throw new BadRequestException('uuid 혹은 uuids가 존재하지 않습니다');

    return value;
  }

  toValidate(value: ReadNotificationDto) {
    if (!Object.keys(removeNilFromObject(value)).length) return false;

    if (value.uuid || value?.uuids.length) {
      return true;
    }
    return false;
  }
}
