import { NotificationType } from 'src/common/constants';

export class CreateNotificationDto {
  type: NotificationType;
  data: any;
  userId: number;
  targetId: number;
  read: boolean;
  createdAt: Date;
}
