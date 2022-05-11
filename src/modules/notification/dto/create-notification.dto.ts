import { NotificationType } from 'src/common/constants';

export class CreateNotificationDto {
  type: NotificationType;
  data: any;
  userId: number;
  targetId: number;

  constructor(
    type: NotificationType,
    data: any,
    userId: number,
    targetId: number,
  ) {
    this.type = type;
    this.data = data;
    this.userId = userId;
    this.targetId = targetId;
  }
}
