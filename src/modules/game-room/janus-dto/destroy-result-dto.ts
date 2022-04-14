import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { JanusResponseEvent } from '../constants/janus-response-event';

export class DestroyResultDto {
  @Expose()
  @IsNotEmpty()
  @IsEnum(JanusResponseEvent)
  videoroom: JanusResponseEvent.DESTROYED;

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  room: number;

  constructor() {}

  static of(room: number): DestroyResultDto {
    const dto = new DestroyResultDto();
    dto.videoroom = JanusResponseEvent.DESTROYED;
    dto.room = room;
    return dto;
  }
}
