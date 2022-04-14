import { HttpModule } from '@nestjs/axios';
import { Logger, Module } from '@nestjs/common';
import { ConfigService } from 'aws-sdk';
import { JanusService } from './janus.service';

@Module({
  imports: [HttpModule],
  providers: [Logger, JanusService, ConfigService],
  exports: [JanusService],
})
export class JanusModule {}
