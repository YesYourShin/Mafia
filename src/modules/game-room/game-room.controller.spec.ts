import { Test, TestingModule } from '@nestjs/testing';
import { GameRoomController } from './game-room.controller';
import { GameRoomService } from './game-room.service';

describe('GameRoomController', () => {
  let controller: GameRoomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameRoomController],
      providers: [GameRoomService],
    }).compile();

    controller = module.get<GameRoomController>(GameRoomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
