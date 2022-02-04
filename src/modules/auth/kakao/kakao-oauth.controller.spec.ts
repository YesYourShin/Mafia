import { Test, TestingModule } from '@nestjs/testing';
import { KakaoOauthController } from './kakao-oauth.controller';

describe('KakaoOauthController', () => {
  let controller: KakaoOauthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KakaoOauthController],
      providers: [],
    }).compile();

    controller = module.get<KakaoOauthController>(KakaoOauthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
