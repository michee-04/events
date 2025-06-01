import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MAIN_DATABASE_CONNECTION_NAME } from '@app/common/constants';
import { BaseRepository } from '@app/core/providers/base.mongo.repository';
import { Programme } from '../models/program';

@Injectable()
export class ProgrammeRepository extends BaseRepository<Programme> {
  constructor(
    @InjectModel(Programme.name, MAIN_DATABASE_CONNECTION_NAME)
    model: Model<Programme>,
  ) {
    super(model);
  }

  async getTitle(title: string) {
    return this.get({ title, deleted: false });
  }

  async getTitleExists(title: string, eventId: any) {
    return this.exists({ title, eventId, deleted: false });
  }

  async getEventByProgramme(eventId: string) {
    return this.get({ eventId: eventId, deleted: false });
  }
}
