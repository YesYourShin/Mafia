import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/modules/user/user.repository';
import { NaverOauthController } from './naver-oauth.controller';
import { NaverOauthStrategy } from './naver-oauth.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository]),
    PassportModule.register({ session: true }),
  ],
  controllers: [NaverOauthController],
  providers: [NaverOauthStrategy],
})
export class NaverOauthModule {}
