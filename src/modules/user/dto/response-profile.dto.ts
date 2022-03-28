import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto';
import { Profile } from 'src/entities';

export class ResponseProfileDto<ResponseProfile> extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({ type: () => ProfileInfo })
  data: ResponseProfile;
}
export class ProfileInfo extends OmitType(Profile, ['deletedAt']) {}
