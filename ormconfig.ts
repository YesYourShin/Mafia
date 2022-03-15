import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import {
  Category,
  Comment,
  DM,
  Post,
  Friend,
  Game,
  GameMember,
  GameRole,
  Like,
  Notification,
  Profile,
  Report,
  ReportType,
  User,
  View,
} from './src/entities';

const path =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : process.env.NODE_ENV === 'testing'
    ? '.env.testing'
    : '.env.development';

dotenv.config({ path });

const ormconfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    GameRole,
    Category,
    ReportType,
    User,
    Post,
    Friend,
    Comment,
    Game,
    GameMember,
    DM,
    Notification,
    Report,
    Like,
    Profile,
    View,
  ],
  migrations: [__dirname + '/src/migrations/*.ts'],
  cli: { migrationsDir: 'src/migrations' },
  autoLoadEntities: true,
  charset: 'utf8mb4',
  synchronize: false,
  logging: true,
  keepConnectionAlive: true,
};

export = ormconfig;
