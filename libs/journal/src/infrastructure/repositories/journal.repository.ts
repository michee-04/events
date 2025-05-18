import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { JOURNAL_DATABASE_CONNECTION_NAME } from '@app/common/constants';
import { BaseRepository } from '@app/core/providers/base.mongo.repository';
import { Journal } from '../models/journal';

@Injectable()
export class JournalRepository extends BaseRepository<Journal> {
  constructor(
    @InjectModel(Journal.name, JOURNAL_DATABASE_CONNECTION_NAME)
    model: Model<Journal>,
  ) {
    super(model);
  }
}
