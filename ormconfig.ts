import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { Comment } from 'src/entities/Comment';
import { DM } from 'src/entities/DM';
import { Friend } from 'src/entities/Friend';
import { Game } from 'src/entities/Game';
import { GameChat } from 'src/entities/GameChat';
import { GameMember } from 'src/entities/GameMember';
import { GameRole } from 'src/entities/GameRole';
import { Notification } from 'src/entities/Notification';
import { Post } from 'src/entities/Post';
import { PostCategory } from 'src/entities/PostCategory';
import { Recommendation } from 'src/entities/Recommendation';
import { Report } from 'src/entities/Report';
import { ReportCategory } from 'src/entities/ReportCategory';
import { User } from 'src/entities/User';
import { WholeChat } from 'src/entities/WholeChat';

dotenv.config();

export const ormconfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    GameRole,
    PostCategory,
    ReportCategory,
    User,
    Post,
    Friend,
    Comment,
    Game,
    GameMember,
    GameChat,
    WholeChat,
    DM,
    Notification,
    Report,
    Recommendation,
  ],
  migrations: [__dirname + '/src/migrations/*.ts'],
  cli: { migrationsDir: 'src/migrations' },
  autoLoadEntities: true,
  charset: 'utf8mb4',
  synchronize: true,
  logging: true,
  keepConnectionAlive: true,
};
