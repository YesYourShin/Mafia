import { Test, TestingModule } from '@nestjs/testing';
import { UserMessageGateway } from './user-message.gateway';

describe('UserMessageGateway', () => {
  let gateway: UserMessageGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserMessageGateway],
    }).compile();

    gateway = module.get<UserMessageGateway>(UserMessageGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
