import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ObjectId } from 'mongoose';

import { MAIN_DATABASE_CONNECTION_NAME } from '@app/common/constants';
import {
  BaseRepository,
  SelectQuery,
  SortQuery,
} from '@app/core/providers/base.mongo.repository';
import { User } from '../models/user';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectModel(User.name, MAIN_DATABASE_CONNECTION_NAME)
    model: Model<User>,
  ) {
    super(model);
  }

  async getActiveById(id: ObjectId | string) {
    return this.getOne({ _id: id, active: true, deleted: false });
  }

  async getNotDeletedById(id: ObjectId | string) {
    return this.getOne({ _id: id, deleted: false });
  }

  async getByEmail(email: string) {
    return this.getOne({ email });
  }

  async getActiveByEmail(email: string) {
    return this.getOne({ email, active: true, verified: true });
  }

  async getByPhone(phone: string) {
    return this.getOne({ phone });
  }

  async getActiveByPhone(phone: string) {
    return this.getOne({ phone, active: true, verified: true });
  }

  async get(
    filter: FilterQuery<User> = {},
    limit = 20,
    skip = 0,
    sort: SortQuery<User> = { createdAt: -1 },
    select: SelectQuery<User> = { password: 0, passwordSalt: 0 },
  ) {
    return super.get(filter, limit, skip, sort, select);
  }

  async getAll(
    filter: FilterQuery<User> = {},
    sort: SortQuery<User> = { createdAt: -1 },
    select: SelectQuery<User> = { password: 0, passwordSalt: 0 },
  ) {
    return super.getAll(filter, sort, select);
  }
}
