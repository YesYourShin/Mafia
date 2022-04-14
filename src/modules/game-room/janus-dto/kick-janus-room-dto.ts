import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { JanusRequestEvent } from '../constants/janus-request-event';

export class KickJanusRoomDto {
  @IsString()
  request: JanusRequestEvent;

  @IsOptional()
  @IsInt()
  room?: number;

  @IsInt()
  publishers: number;

  @IsOptional()
  @IsString()
  pin?: string;

  @IsOptional()
  @IsString()
  secret?: string;

  @IsBoolean()
  is_private: boolean;

  @IsString()
  description: string;

  @IsNumber()
  id: number;
}
