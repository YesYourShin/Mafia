import { ApiProperty } from '@nestjs/swagger';
import { EnumStatus } from 'src/common/constants/enum-status';

export class RequestFriendRequestDto {
  @ApiProperty({
    name: 'requestAction',
    type: EnumStatus,
    enum: EnumStatus,
  })
  requestAction: EnumStatus;
}
