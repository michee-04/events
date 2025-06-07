import { MAIN_DATABASE_CONNECTION_NAME } from '@app/common/constants';
import {
  BaseRepository,
  SelectQuery,
  SortQuery,
} from '@app/core/providers/base.mongo.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ObjectId } from 'mongoose';
import { MinioFile } from '../models/minioFile';

@Injectable()
export class MinioFileRepository extends BaseRepository<MinioFile> {
  constructor(
    @InjectModel(MinioFile.name, MAIN_DATABASE_CONNECTION_NAME)
    model: Model<MinioFile>,
  ) {
    super(model);
  }

  async getActiveById(id: ObjectId | string) {
    return this.getOne({ _id: id, active: true, deleted: false });
  }

  async get(
    filter: FilterQuery<MinioFile> = {},
    limit = 20,
    skip = 0,
    sort: SortQuery<MinioFile> = { createdAt: -1 },
    select: SelectQuery<MinioFile> = null,
  ) {
    return super.get(filter, limit, skip, sort, select);
  }

  async getAll(
    filter: FilterQuery<MinioFile> = {},
    sort: SortQuery<MinioFile> = { createdAt: -1 },
    select: SelectQuery<MinioFile> = null,
  ) {
    return super.getAll(filter, sort, select);
  }

  async updateFile(downloadUrl: string, eventId: ObjectId | string) {
    const filter: FilterQuery<MinioFile> = { downloadUrl };

    return this.upsert(filter, { fileId: eventId });
  }
}
