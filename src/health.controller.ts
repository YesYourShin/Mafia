import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

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
    return this.health.check([
      () =>
        this.http.pingCheck('mafia', 'http://localhost:3065/api/health/ping'),
      () => this.db.pingCheck('database'),
    ]);
  }

  @Get('ping')
  ping() {
    return 'pong';
  }
}
