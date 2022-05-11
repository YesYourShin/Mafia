import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class RequestParamIdGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const { id } = request.params;

    if (+id !== user.id) {
      throw new BadRequestException('자신의 요청이 아닙니다');
    }
    return true;
  }
}
