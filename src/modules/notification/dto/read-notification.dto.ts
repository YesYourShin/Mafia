import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ReadNotificationDto {
  @ApiProperty({
    name: 'uuid',
    example: 'asdfsadjfhkjashfkjhaskjfdhashdkjl',
    description: '하나만 읽을 때 사용',
  })
  @IsString()
  @IsOptional()
  uuid?: string;

  @ApiProperty({
    name: 'uuids',
    example: ['uuid1', 'uuid2'],
    description: '알림 한번에 읽을 수 있도록 배열 형식으로 전달받음',
  })
  @IsString({ each: true })
  @IsOptional()
  uuids?: string[];
}
