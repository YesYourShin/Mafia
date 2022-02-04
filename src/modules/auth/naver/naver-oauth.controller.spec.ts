import { Test, TestingModule } from '@nestjs/testing';
import { NaverOauthController } from './naver-oauth.controller';

describe('NaverOauthController', () => {
  let controller: NaverOauthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NaverOauthController],
    }).compile();

    controller = module.get<NaverOauthController>(NaverOauthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
