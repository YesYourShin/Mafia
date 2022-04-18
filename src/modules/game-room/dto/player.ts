import { ApiProperty } from '@nestjs/swagger';
import { ImageDto } from 'src/modules/user/dto';
import { Member } from './member';

export class Player {
  @ApiProperty({
    example: 1,
    description: '프로필 고유 ID',
  })
  id: number;

  @ApiProperty({
    example: 'gjgjajaj',
    description: '닉네임',
  })
  nickname: string;

  @ApiProperty({ type: () => ImageDto })
  image?: ImageDto | null;

  @ApiProperty({
    example: 3,
    description: '게임 레벨',
  })
  level: number;

  @ApiProperty({
    example: 1,
    description: '유저 ID',
  })
  userId: number;

  @ApiProperty({
    example: 'citizen',
    description: '직업',
  })
  job: string;

  @ApiProperty({
    example: false,
    description: '생존 상태',
  })
  die: boolean;

  constructor(member: Member) {
    this.id = member.id;
    this.nickname = member.nickname;
    this.image = member?.image || null;
    this.level = member.level;
    this.userId = member.userId;
    this.job = null;
    this.die = false;
  }
}

// export class Member {
//   @Exclude() private readonly _id: number;
//   @Exclude() private readonly _nickname: string;
//   @Exclude() private readonly _image?: ImageDto | null;
//   @Exclude() private readonly _level: number;
//   @Exclude() private readonly _userId: number;
//   @Exclude() private _ready: boolean;

//   constructor(profile: ProfileInfo) {
//     this._id = profile.id;
//     this._nickname = profile.nickname;
//     this._image = profile?.image || null;
//     this._level = profile.level;
//     this._userId = profile.userId;
//     this._ready = false;
//   }

//   @ApiProperty({
//     example: 1,
//     description: '프로필 고유 ID',
//   })
//   @Expose()
//   get id(): number {
//     return this._id;
//   }

//   @ApiProperty({
//     example: 'gjgjajaj',
//     description: '닉네임',
//   })
//   @Expose()
//   get nickname(): string {
//     return this._nickname;
//   }

//   @ApiProperty({ type: () => ImageDto })
//   @Expose()
//   get image(): ImageDto | null {
//     return this._image;
//   }

//   @ApiProperty({
//     example: 3,
//     description: '게임 레벨',
//   })
//   @Expose()
//   get level(): number {
//     return this._level;
//   }

//   @ApiProperty({
//     example: 1,
//     description: '유저 ID',
//   })
//   @Expose()
//   get userId(): number {
//     return this._userId;
//   }

//   @ApiProperty({
//     description: '준비 상태',
//     name: 'ready',
//     example: true,
//     required: false,
//   })
//   @Expose()
//   get ready(): boolean {
//     return this._ready;
//   }

//   set ready(ready: boolean) {
//     this._ready = ready;
//   }
// }
