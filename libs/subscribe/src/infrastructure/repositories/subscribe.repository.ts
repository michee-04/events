import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MAIN_DATABASE_CONNECTION_NAME } from '@app/common/constants';
import { BaseRepository } from '@app/core/providers/base.mongo.repository';
import { Subscribe } from '../models/subscribe';

@Injectable()
export class SubscribeRepository extends BaseRepository<Subscribe> {
  constructor(
    @InjectModel(Subscribe.name, MAIN_DATABASE_CONNECTION_NAME)
    model: Model<Subscribe>,
  ) {
    super(model);
  }
}
