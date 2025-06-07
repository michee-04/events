import { LeanedDocument } from '@app/nest-core/core/providers/base.mongo.repository';
import { User } from '@app/nest-core/user-access-control/infrastructure/models/user';

declare global {
  namespace Express {
    interface Request {
      user?: LeanedDocument<User> | null;
      filterQuery: {
        page: number;
        limit: number;
        skip: number;
        query: string;
        type: string;
        countryCode: string;
      };
      uploadedFile?: Express.Multer.File & {
        extension: string;
        timestamp: number;
        bucket: string;
        hash: string;
      };
    }
  }
}
