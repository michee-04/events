import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';

import { MAIN_DATABASE_CONNECTION_NAME } from '@app/common/constants';
import { BaseRepository } from '@app/core/providers/base.mongo.repository';
import { UserNotification } from '../models/userNotification';

@Injectable()
export class UserNotificationRepository extends BaseRepository<UserNotification> {
  constructor(
    @InjectModel(UserNotification.name, MAIN_DATABASE_CONNECTION_NAME)
    readonly model: Model<UserNotification>,
  ) {
    super(model);
  }

  async getActiveById(id: ObjectId | string) {
    return this.getOne({ _id: id, active: true, deleted: false });
  }

  async getByIdAndUser(id: ObjectId | string, userId: ObjectId | string) {
    return this.getOne({ _id: id, userId });
  }

  async getActiveByIdAndUser(id: ObjectId | string, userId: ObjectId | string) {
    return this.getOne({ _id: id, userId, active: true, deleted: false });
  }
}
