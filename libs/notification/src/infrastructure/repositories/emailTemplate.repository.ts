import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';

import { MAIN_DATABASE_CONNECTION_NAME } from '@app/common/constants';
import { BaseRepository } from '@app/core/providers/base.mongo.repository';
import { EmailTemplate } from '../models/emailTemplate';

@Injectable()
export class EmailTemplateRepository extends BaseRepository<EmailTemplate> {
  constructor(
    @InjectModel(EmailTemplate.name, MAIN_DATABASE_CONNECTION_NAME)
    readonly model: Model<EmailTemplate>,
  ) {
    super(model);
  }

  async getActiveById(id: ObjectId | string) {
    return this.getOne({ _id: id, active: true, deleted: false });
  }

  async getNotDeletedById(id: ObjectId | string) {
    return this.getOne({ _id: id, deleted: false });
  }

  async getBySlug(slug: string) {
    return this.getOne({ slug });
  }

  async getActiveBySlug(slug: string) {
    return this.getOne({ slug, active: true, deleted: false });
  }
}
