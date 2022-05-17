import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { NotificationType } from 'src/common/constants';
import { INVITE_GAME } from '../gateway/game-room/constants/user-event';
import { GameRoomEventService } from '../gateway/game-room/game-room-event.service';
import { UserEventService } from '../gateway/user/user-event.service';
import { UserGateway } from '../gateway/user/user.gateway';
import { CreateNotificationDto } from '../notification/dto';
import { NotificationService } from '../notification/notification.service';
import { ProfileInfo } from '../user/dto';

@Injectable()
export class GameRoomService {
  constructor(
    private readonly gameRoomEventService: GameRoomEventService,
    private readonly notificationService: NotificationService,
    private readonly userGateway: UserGateway,
    private readonly userEventService: UserEventService,
  ) {}
  async invite(
    roomId: number,
    profile: ProfileInfo,
    userId: number,
    targetId: number,
  ) {
    if (profile.userId !== userId) {
      throw new BadRequestException('초대를 요청한 유저가 아닙니다');
    }

    const online = await this.userEventService.getOnline(targetId);

    if (!online) {
      throw new ForbiddenException('상대방이 온라인이 아닙니다');
    }

    const game = await this.gameRoomEventService.findOneOfRoomInfo(roomId);

    const createNotificationDto = new CreateNotificationDto(
      NotificationType.INVITED_GAME,
      JSON.stringify({
        roomId,
        message: `${profile.nickname}님으로부터 「${game.description}」방으로 초대받았습니다`,
      }),
      userId,
      targetId,
    );

    const notification = await this.notificationService.create(
      createNotificationDto,
    );

    notification.data = JSON.parse(notification.data);

    this.userGateway.server
      .to(`/user-${targetId}`)
      .emit(INVITE_GAME, notification);

    return '게임 방 초대 완료';
  }

  async accept(
    roomId: number,
    profile: ProfileInfo,
    targetId: number,
    uuid: string,
  ) {
    if (profile.userId !== targetId) {
      throw new BadRequestException('초대받은 유저가 아닙니다');
    }

    const notification = await this.notificationService.findOne(uuid);

    if (notification.type !== NotificationType.INVITED_GAME) {
      throw new ForbiddenException('게임 초대 요청이 아닙니다');
    }

    if (notification.targetId !== targetId) {
      throw new ForbiddenException('게임 초대 대상자가 아닙니다');
    }

    const room = await this.gameRoomEventService.findOneOfRoomInfo(roomId);
    if (!room) {
      throw new ForbiddenException('존재하지 않는 게임 방입니다');
    }

    const members = await this.gameRoomEventService.findMembersByRoomId(roomId);
    if (room.publishers <= members.length) {
      throw new ForbiddenException('방의 인원이 초과되었습니다');
    }
    return { roomId, joinable: true, pin: room?.pin ? room.pin : null };
  }
}
