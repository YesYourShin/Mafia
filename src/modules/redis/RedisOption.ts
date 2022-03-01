import { RedisOptions } from 'ioredis';

type RedisDBName = 'GAME' | 'SESSION' | 'CHAT' | 'CACHE';

class RedisOption implements RedisOptions {
  host = process.env.REDIS_HOST;
  port = +process.env.REDIS_PORT;
  db: number;

  constructor(name: RedisDBName) {
    switch (name) {
      case 'SESSION':
        this.db = +process.env.REDIS_SESSION_DB;
        break;
      case 'GAME':
        this.db = +process.env.REDIS_GAME_DB;
        break;
      case 'CHAT':
        this.db = +process.env.REDIS_CHAT_DB;
        break;
      case 'CACHE':
        this.db = +process.env.REDIS_CACHE_DB;
        break;
    }
  }

  option() {
    return {
      host: this.host,
      port: this.port,
      db: this.db,
    };
  }
}

export const RedisSessionOption = new RedisOption('SESSION').option();
export const RedisGameOption = new RedisOption('GAME').option();
export const RedisChatOption = new RedisOption('CHAT').option();
