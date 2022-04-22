import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class NumberValidationPipe implements PipeTransform {
  transform(value: number, metadata: ArgumentMetadata) {
    if (!metadata || !this.toValidate(value))
      throw new BadRequestException('숫자만 입력 가능합니다.');

    return value;
  }
  private toValidate(value: number) {
    return value.toString().match(/[0-9]/);
  }
}
