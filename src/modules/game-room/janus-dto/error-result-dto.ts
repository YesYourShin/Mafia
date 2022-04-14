import { Expose } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { JanusResponseEvent } from '../constants/janus-response-event';

export class ErrorResultDto {
  @Expose()
  @IsNotEmpty()
  @IsEnum(JanusResponseEvent)
  videoroom: JanusResponseEvent.EVENT;

  @Expose()
  @IsNotEmpty()
  @IsInt()
  error_code: number;

  @Expose()
  @IsNotEmpty()
  @IsString()
  error: string;

  constructor() {}

  static of(
    videoroom: JanusResponseEvent.EVENT,
    error_code: number,
    error: string,
  ): ErrorResultDto {
    const dto = new ErrorResultDto();
    dto.videoroom = videoroom;
    dto.error_code = error_code;
    dto.error = error;
    return dto;
  }
}
