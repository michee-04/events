import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MAIN_DATABASE_CONNECTION_NAME } from '@app/common/constants';
import { BaseRepository } from '@app/core/providers/base.mongo.repository';
import { Events } from '../models/events';

@Injectable()
export class EventsRepository extends BaseRepository<Events> {
  constructor(
    @InjectModel(Events.name, MAIN_DATABASE_CONNECTION_NAME)
    model: Model<Events>,
  ) {
    super(model);
  }

  async getTitle(title: string) {
    return this.exists({ title, deleted: false });
  }
}
