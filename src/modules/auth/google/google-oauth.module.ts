import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/modules/user/user.repository';
import { SessionSerializer } from '../session.serializer';
import { GoogleOauthController } from './google-oauth.controller';
import { GoogleOauthStrategy } from './google-oauth.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository]),
    PassportModule.register({ session: true }),
  ],
  controllers: [GoogleOauthController],
  providers: [GoogleOauthStrategy, SessionSerializer],
})
export class GoogleOauthModule {}
