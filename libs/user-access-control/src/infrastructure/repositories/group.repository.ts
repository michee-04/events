import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';

import { MAIN_DATABASE_CONNECTION_NAME } from '@app/common/constants';
import { BaseRepository } from '@app/core/providers/base.mongo.repository';
import { Group } from '../models/group';

@Injectable()
export class GroupRepository extends BaseRepository<Group> {
  constructor(
    @InjectModel(Group.name, MAIN_DATABASE_CONNECTION_NAME)
    model: Model<Group>,
  ) {
    super(model);
  }

  async getActiveById(id: ObjectId | string) {
    return this.getOne({ _id: id, active: true, deleted: false });
  }

  async getNotDeletedById(id: ObjectId | string) {
    return this.getOne({ _id: id, deleted: false });
  }
}
