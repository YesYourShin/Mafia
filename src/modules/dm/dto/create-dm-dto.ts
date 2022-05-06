import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDMDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    name: 'message',
    description: 'DM 메시지',
    required: true,
    example: { message: 'Hello world' },
  })
  message: string;
}
