import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/modules/user/user.repository';
import { KakaoOauthController } from './kakao-oauth.controller';
import { KakaoOauthStrategy } from './kakao-oauth.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository]),
    PassportModule.register({ session: true }),
  ],
  controllers: [KakaoOauthController],
  providers: [KakaoOauthStrategy],
})
export class KakaoOauthModule {}
