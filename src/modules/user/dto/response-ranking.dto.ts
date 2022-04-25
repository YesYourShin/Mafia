import { ApiProperty, PickType } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto';
import { Profile } from 'src/entities';

export class RankingDto extends PickType(Profile, [
  'nickname',
  'exp',
  'level',
]) {
  @ApiProperty({
    example: 'https://***.**.**.com/original/**/1649000570209_**.PNG',
    description: '파일 경로',
  })
  location: string;
}

export class ResponseRankingDto extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({ type: () => RankingDto, isArray: true })
  data: RankingDto;
}
