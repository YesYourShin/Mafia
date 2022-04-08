import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    //nginx 설정 해야 함
    const backendURL = `${this.configService.get('BACKEND_URL')}/health/ping`;
    return this.health.check([
      () => this.http.pingCheck('mafia', backendURL),
      () => this.db.pingCheck('database'),
    ]);
  }

  @ApiOkResponse({
    schema: {
      example: 'pong',
    },
  })
  @Get('ping')
  ping() {
    return 'pong';
  }
}
