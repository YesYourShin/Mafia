import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  constructor(success: boolean, status: number, data: T) {
    this.success = success;
    this.status = status;
    this.data = data;
  }
  @ApiProperty({
    description: '성공 여부 / 성공 - true / 실패 false',
    examples: [true, false],
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Status code 200~500',
    examples: [200, 201, 301, 401, 402, 403, 404],
    example: 200,
  })
  status: number;

  data: T;
}
