import { GameMode } from 'src/common/constants';
import { GameRoom } from '../game-room/dto';

export class CreateGameDto {
  private readonly _mode: GameMode;
  private readonly _name: string;
  private readonly _password?: string;
  private readonly _limit: number;

  constructor(gameRoom: GameRoom) {
    this._mode = gameRoom.mode;
    this._name = gameRoom.description;
    this._password = gameRoom.pin;
    this._limit = gameRoom.publishers;
  }

  get mode(): GameMode {
    return this._mode;
  }

  get name(): string {
    return this._name;
  }

  get password(): string {
    return this._password || null;
  }

  get limit(): number {
    return this._limit;
  }
}
