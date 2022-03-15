import { ApiProperty, PickType } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto';
import { ObjectLiteral } from '../paginate';

class Profile {
  id: number;
  nickname: string;
}
class Items {
  id: number;
  title: string;
  categoryId: number;
  updatedAt: Date;
  profile: Profile;
  commentCount: number;
  likeCount: number;
  views: number;
}
class Meta {
  itemCount: number;
  totalItems?: number;
  totalPages?: number;
  currentPage: number;
}

class FindAllDto {
  public readonly items: Items[];
  public readonly meta: Meta;
  public readonly links?: ObjectLiteral;
}
export class FindAllResponseDto extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({
    description: '카테고리 별 게시물 페이지네이션',
    example: {
      items: [
        {
          id: '36',
          title: '안녕하세요',
          categoryId: 2,
          updatedAt: '2022-03-11T07:32:05.133Z',
          profile: {
            id: '1',
            nickname: 'audwns',
          },
          commentCount: 0,
          likeCount: 0,
          views: 0,
        },
        {
          id: '35',
          title: '안녕하세요',
          categoryId: 2,
          updatedAt: '2022-03-11T06:39:22.358Z',
          profile: {
            id: '1',
            nickname: 'audwns',
          },
          commentCount: 0,
          likeCount: 0,
          views: 0,
        },
        {
          id: '34',
          title: '안녕하세요',
          categoryId: 2,
          updatedAt: '2022-03-11T06:39:21.922Z',
          profile: {
            id: '1',
            nickname: 'audwns',
          },
          commentCount: 0,
          likeCount: 0,
          views: 0,
        },
        {
          id: '33',
          title: '안녕하세요',
          categoryId: 2,
          updatedAt: '2022-03-11T06:39:21.543Z',
          profile: {
            id: '1',
            nickname: 'audwns',
          },
          commentCount: 0,
          likeCount: 0,
          views: 0,
        },
        {
          id: '32',
          title: '안녕하세요',
          categoryId: 2,
          updatedAt: '2022-03-11T06:39:21.085Z',
          profile: {
            id: '1',
            nickname: 'audwns',
          },
          commentCount: 0,
          likeCount: 0,
          views: 0,
        },
        {
          id: '31',
          title: '안녕하세요',
          categoryId: 2,
          updatedAt: '2022-03-11T06:39:20.723Z',
          profile: {
            id: '1',
            nickname: 'audwns',
          },
          commentCount: 0,
          likeCount: 0,
          views: 0,
        },
        {
          id: '30',
          title: '안녕하세요',
          categoryId: 2,
          updatedAt: '2022-03-11T06:39:20.293Z',
          profile: {
            id: '1',
            nickname: 'audwns',
          },
          commentCount: 0,
          likeCount: 0,
          views: 0,
        },
        {
          id: '29',
          title: '안녕하세요',
          categoryId: 2,
          updatedAt: '2022-03-11T06:39:19.906Z',
          profile: {
            id: '1',
            nickname: 'audwns',
          },
          commentCount: 0,
          likeCount: 0,
          views: 0,
        },
        {
          id: '28',
          title: '안녕하세요',
          categoryId: 2,
          updatedAt: '2022-03-11T06:39:19.498Z',
          profile: {
            id: '1',
            nickname: 'audwns',
          },
          commentCount: 4,
          likeCount: 0,
          views: 0,
        },
        {
          id: '27',
          title: '안녕하세요',
          categoryId: 2,
          updatedAt: '2022-03-11T06:39:19.049Z',
          profile: {
            id: '1',
            nickname: 'audwns',
          },
          commentCount: 0,
          likeCount: 0,
          views: 0,
        },
      ],
      meta: {
        itemCount: 10,
        totalItems: 24,
        totalPages: 3,
        currentPage: 1,
      },
      links: {
        '1': 'http://localhost:3065/api/posts?category=2&page=1',
        '2': 'http://localhost:3065/api/posts?category=2&page=2',
        '3': 'http://localhost:3065/api/posts?category=2&page=3',
      },
    },
  })
  data: FindAllDto;
}
