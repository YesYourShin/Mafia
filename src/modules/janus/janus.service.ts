import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';
import { instanceToPlain } from 'class-transformer';
import { firstValueFrom } from 'rxjs';
import { JanusRequestEvent } from '../game-room/constants/janus-request-event';
import { CreateGameRoomDto } from '../game-room/dto';
import {
  CreateJanusRoomDto,
  CreateResultDto,
  DestroyJanusRoomDto,
  JanusRequest,
  JanusRequestDto,
  JanusResponseDto,
  JanusRoomListDto,
  JanusRoomListParticipantsDto,
} from '../game-room/janus-dto';
import { DestroyResultDto } from '../game-room/janus-dto/destroy-result-dto';
@Injectable()
export class JanusService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async destroyJanusRoom(room: number): Promise<DestroyResultDto> {
    const destroyJanusRoomDto = new DestroyJanusRoomDto(room);
    const response = await this.requestJanus(destroyJanusRoomDto);
    return response.data;
  }

  async getJanusRoomList() {
    const janusRoomListDto = new JanusRoomListDto(JanusRequestEvent.LIST);
    const response = await this.requestJanus(janusRoomListDto);
    return response.data;
  }

  async getJanusRoomListParticipants(room: number) {
    const janusRoomListParticipantsDto = new JanusRoomListParticipantsDto(
      JanusRequestEvent.LIST_PARTICIPANTS,
      room,
      this.configService.get('JANUS_ADMIN_KEY'),
    );
    const response = await this.requestJanus(janusRoomListParticipantsDto);
    return response.data;
  }
  async createJanusRoom(
    createGameRoomDto: CreateGameRoomDto,
  ): Promise<JanusResponseDto<CreateResultDto>> {
    const createJanusRoomDto = new CreateJanusRoomDto(
      createGameRoomDto,
      this.configService.get('JANUS_ADMIN_KEY'),
    );
    const response = await this.requestJanus(createJanusRoomDto);
    return response.data;
  }
  async requestJanus(janusRequest: JanusRequest): Promise<AxiosResponse<any>> {
    const request = instanceToPlain(
      new JanusRequestDto(
        this.makeRandomNumber(12),
        this.configService.get('JANUS_ADMIN_SECRET'),
        janusRequest,
      ),
      { excludeExtraneousValues: true },
    );
    console.log(request);
    return firstValueFrom(
      this.httpService.post(this.configService.get('JANUS_URL'), request),
    );
  }

  makeRandomNumber(length: number): string {
    const randomNumber = Math.floor(Math.random() * 1000000000000);
    return randomNumber
      .toString()
      .padStart(length, Math.floor(Math.random() * 10).toString());
  }
}
