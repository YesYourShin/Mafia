import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { JanusResponseEvent } from '../constants/janus-response-event';

export class CreateResultDto {
  @Expose()
  @IsNotEmpty()
  @IsEnum(JanusResponseEvent)
  videoroom: JanusResponseEvent.CREATED;

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  room: number;

  @Expose()
  @IsOptional()
  @IsBoolean()
  permanent?: boolean | null;

  constructor() {}

  static of(room: number): CreateResultDto {
    const dto = new CreateResultDto();
    dto.videoroom = JanusResponseEvent.CREATED;
    dto.room = room;
    return dto;
  }
}
