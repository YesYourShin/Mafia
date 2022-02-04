import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../user/user.repository';
import { GoogleOauthModule } from './google/google-oauth.module';
import { KakaoOauthModule } from './kakao/kakao-oauth.module';
import { NaverOauthModule } from './naver/naver-oauth.module';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [
    PassportModule.register({ session: true }),
    TypeOrmModule.forFeature([UserRepository]),
    GoogleOauthModule,
    NaverOauthModule,
    KakaoOauthModule,
  ],
  providers: [SessionSerializer],
})
export class OAuthModule {}
