import { ErrorResult } from '@app/common/utils';
import { LeanedDocument } from '@app/core/providers/base.mongo.repository';
import { Injectable } from '@nestjs/common';
import { UserNotification } from '../../infrastructure/models/userNotification';
import { UserNotificationRepository } from '../../infrastructure/repositories/userNotification.repository';

@Injectable()
export class UserNotificationService {
  constructor(
    private readonly userNotificationRepository: UserNotificationRepository,
  ) {}

  async delete(id: string, userId?: string) {
    let notification: LeanedDocument<UserNotification> | null;

    if (userId) {
      notification = await this.userNotificationRepository.getActiveByIdAndUser(
        id,
        userId,
      );
    } else {
      notification = await this.userNotificationRepository.getActiveById(id);
    }

    if (!notification) {
      throw new ErrorResult({
        code: 404_003,
        clean_message: 'La notification est introuvable',
        message: `La notification [${id}] est introuvable`,
      });
    }

    notification.active = false;
    notification.deleted = true;
    notification.deletedAt = new Date();

    return this.userNotificationRepository.update(notification);
  }

  async getById(id: string, userId?: string, active = false) {
    let notification: LeanedDocument<UserNotification> | null = null;

    if (active) {
      if (userId) {
        notification =
          await this.userNotificationRepository.getActiveByIdAndUser(
            id,
            userId,
          );
      } else {
        notification = await this.userNotificationRepository.getActiveById(id);
      }
    } else {
      if (userId) {
        notification = await this.userNotificationRepository.getByIdAndUser(
          id,
          userId,
        );
      } else {
        notification = await this.userNotificationRepository.getById(id);
      }
    }

    if (!notification) {
      throw new ErrorResult({
        code: 404_003,
        clean_message: 'La notification est introuvable',
        message: `La notification [${id}] est introuvable`,
      });
    }

    return notification;
  }
}
