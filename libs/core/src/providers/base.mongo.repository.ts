import { ObjectUtils } from '@app/common/utils';
import {
  CreateOptions,
  Document,
  Model,
  ObjectId,
  QueryOptions,
  RootFilterQuery,
  Schema,
  SortOrder,
  Types,
  UpdateQuery,
} from 'mongoose';

export type FilterQuery<T> = RootFilterQuery<T>;
export type SortQuery<T> =
  | ({ [key in keyof Partial<T>]: SortOrder } & { [key: string]: SortOrder })
  | null;
export type SelectQuery<T> =
  | ({ [key in keyof Partial<T>]: 0 | 1 } & { [key: string]: 0 | 1 })
  | null;

export type LeanedDocument<T> = Omit<T, keyof Document> & {
  _id: Schema.Types.ObjectId;
};

export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async create(
    input: Partial<T>,
    options?: CreateOptions,
  ): Promise<LeanedDocument<T>>;
  async create(
    input: Partial<T>[],
    options?: CreateOptions,
  ): Promise<LeanedDocument<T>[]>;
  async create(
    input: Partial<T> | Partial<T>[],
    options?: CreateOptions,
  ): Promise<LeanedDocument<T> | LeanedDocument<T>[]> {
    const isArray = Array.isArray(input);
    const docs = await this.model.create(isArray ? input : [input], options);
    const leanedDocs = docs.map((doc) => doc.toObject());
    //@ts-expect-error nestjs
    return isArray ? leanedDocs : leanedDocs[0];
  }

  update(
    update: UpdateQuery<T> & { _id: ObjectId | string },
    options: QueryOptions<T> & { flatten?: boolean } = {},
  ): Promise<LeanedDocument<T> | null> {
    const { flatten = true } = options;
    //@ts-expect-error nestjs
    return this.model
      .findOneAndUpdate(
        { _id: update._id },
        flatten ? { $set: ObjectUtils.flatten(update) } : update,
        { ...options, new: true, runValidators: true },
      )
      .lean()
      .exec();
  }

  upsert(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options: QueryOptions<T> = {},
  ): Promise<LeanedDocument<T>> {
    //@ts-expect-error nestjs
    return this.model
      .findOneAndUpdate(filter, update, {
        ...options,
        upsert: true,
        new: true,
        runValidators: true,
      })
      .lean()
      .exec();
  }

  getById(id: ObjectId | string): Promise<LeanedDocument<T> | null> {
    //@ts-expect-error nestjs
    return this.model.findById(id).lean().exec();
  }

  deleteById(id: ObjectId | string): Promise<LeanedDocument<T> | null> {
    //@ts-expect-error nestjs
    return this.model.findByIdAndDelete(id).lean().exec();
  }

  getOne(
    filter: FilterQuery<T> = {},
    sort: SortQuery<T> = null,
    select: SelectQuery<T> = null,
  ): Promise<LeanedDocument<T> | null> {
    //@ts-expect-error nestjs
    return this.model.findOne(filter).sort(sort).select(select).lean().exec();
  }

  get(
    filter: FilterQuery<T> = {},
    limit = 20,
    skip = 0,
    sort: SortQuery<T> = null,
    select: SelectQuery<T> = null,
  ): Promise<LeanedDocument<T>[]> {
    //@ts-expect-error nestjs
    return this.model
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select(select ?? '')
      .lean()
      .exec();
  }

  getAll(
    filter: FilterQuery<T> = {},
    sort: SortQuery<T> = null,
    select: SelectQuery<T> = null,
  ): Promise<LeanedDocument<T>[]> {
    return this.get(filter, 0, 0, sort, select);
  }

  async updateById(
    id: string | Types.ObjectId,
    update: UpdateQuery<T>,
    options: QueryOptions = {},
  ): Promise<T | null> {
    const objectId = typeof id === 'string' ? new Types.ObjectId(id) : id;
    return await this.model
      .findByIdAndUpdate(objectId, update, { new: true, ...options })
      .exec();
  }

  async exists(
    filter: FilterQuery<T>,
    includeDeleted = false,
  ): Promise<boolean> {
    const query = includeDeleted ? filter : { ...filter, deletedAt: null };
    return (await this.model.exists(query)) !== null;
  }
}
