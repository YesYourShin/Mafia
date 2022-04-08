import { Logger, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { ProfileRepository } from './profile.repository';
import { MulterModule } from '@nestjs/platform-express';
import { ProfileMulterS3Service } from 'src/shared/profile-multer-s3.service';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository, ProfileRepository]),
    MulterModule.registerAsync({
      useClass: ProfileMulterS3Service,
    }),
    ImageModule,
  ],
  controllers: [UserController],
  providers: [UserService, Logger],
})
export class UserModule {}
