import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ObjectId } from 'mongoose';

import { MAIN_DATABASE_CONNECTION_NAME } from '@app/common/constants';
import {
  BaseRepository,
  SelectQuery,
  SortQuery,
} from '@app/core/providers/base.mongo.repository';
import { Token } from '../models/token';

@Injectable()
export class TokenRepository extends BaseRepository<Token> {
  constructor(
    @InjectModel(Token.name, MAIN_DATABASE_CONNECTION_NAME)
    model: Model<Token>,
  ) {
    super(model);
  }

  async getActiveById(id: ObjectId | string) {
    return this.getOne({ _id: id, active: true, deleted: false });
  }

  async getActiveByUserAndAccessToken(
    userId: ObjectId | string,
    accessToken: string,
  ) {
    return this.getOne({
      userId,
      accessToken,
      active: true,
      deleted: false,
    });
  }

  async getActiveByUserAndRefreshToken(
    userId: ObjectId | string,
    refreshToken: string,
  ) {
    return this.getOne({
      userId,
      refreshToken,
      active: true,
      deleted: false,
    });
  }

  async getActiveByUserAndToken(userId: ObjectId | string, token: string) {
    return this.getOne({
      userId,
      $or: [{ accessToken: token }, { refreshToken: token }],
      active: true,
      deleted: false,
    });
  }

  async getAllActiveByUser(userId: ObjectId | string) {
    return this.getAll({ userId, active: true, deleted: false });
  }

  async get(
    filter: FilterQuery<Token> = {},
    limit = 20,
    skip = 0,
    sort: SortQuery<Token> = { createdAt: -1 },
    select: SelectQuery<Token> = {},
  ) {
    return super.get(filter, limit, skip, sort, select);
  }

  async getAll(
    filter: FilterQuery<Token> = {},
    sort: SortQuery<Token> = { createdAt: -1 },
    select: SelectQuery<Token> = {},
  ) {
    return super.getAll(filter, sort, select);
  }
}
