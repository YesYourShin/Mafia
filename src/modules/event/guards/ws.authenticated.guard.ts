import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsAuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const request = client.request;
    const can = request.isAuthenticated();
    if (!can) {
      throw new WsException('유효하지 않은 사용자');
    }
    return can;
  }
}
