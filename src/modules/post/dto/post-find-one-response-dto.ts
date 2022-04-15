import { ApiProperty, PickType } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto';
import { Post, Profile } from 'src/entities';

class CommentDto {
  id: number;
  content: string;
  updatedAt: Date;
  profile: OwnerProfile;
  replyCount: number;
}

class OwnerProfile extends PickType(Profile, ['id', 'nickname', 'image']) {}

export class PostFindOneDto extends PickType(Post, [
  'id',
  'title',
  'content',
  'updatedAt',
]) {
  @ApiProperty({ type: () => OwnerProfile })
  profile: OwnerProfile;
  @ApiProperty({ type: () => CommentDto, isArray: true })
  comments: CommentDto[];
  @ApiProperty({ example: 10, name: 'likeCount' })
  likeCount: number;
  @ApiProperty({ example: true, name: 'isLiked' })
  isLiked?: boolean;
}

export class FindOneResponseDto extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({
    description: '게시물 하나 자세히 보기',
    example: {
      id: '28',
      title: '안녕하세요',
      content: '<html><div>abcd</div></html>',
      updatedAt: '2022-03-11T06:39:19.498Z',
      profile: {
        id: '1',
        nickname: 'audwns',
      },
      comments: [
        {
          id: '1',
          content: '안녕',
          updatedAt: '2022-03-12T04:50:36.707Z',
          profile: {
            id: '1',
            nickname: 'audwns',
          },
          replyCount: 0,
        },
        {
          id: '2',
          content: '안녕',
          updatedAt: '2022-03-12T04:56:02.904Z',
          profile: {
            id: '1',
            nickname: 'audwns',
          },
          replyCount: 0,
        },
        {
          id: '3',
          content: '안녕',
          updatedAt: '2022-03-12T04:56:17.174Z',
          profile: {
            id: '1',
            nickname: 'audwns',
          },
          replyCount: 0,
        },
        {
          id: '4',
          content: '안녕',
          updatedAt: '2022-03-12T04:56:39.672Z',
          profile: {
            id: '1',
            nickname: 'audwns',
          },
          replyCount: 0,
        },
      ],
      likeCount: 0,
    },
  })
  data: PostFindOneDto;
}
