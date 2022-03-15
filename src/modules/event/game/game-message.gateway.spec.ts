import { Test, TestingModule } from '@nestjs/testing';
import { GameMessageGateway } from './game.gateway';

describe('GameMessageGateway', () => {
  let gateway: GameMessageGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameMessageGateway],
    }).compile();

    gateway = module.get<GameMessageGateway>(GameMessageGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
