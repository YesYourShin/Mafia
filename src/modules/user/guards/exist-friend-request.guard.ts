import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRepository } from '../user.repository';

@Injectable()
export class ExistFriendRequestGuard implements CanActivate {
  constructor(private readonly userRepository: UserRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { id, requestId } = request.params;

    const friendRequest = await this.userRepository.existFriendRequest(
      +id,
      +requestId,
    );
    if (!friendRequest) {
      throw new ForbiddenException('친구 요청이 없습니다');
    }
    return true;
  }
}
