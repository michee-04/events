import { SetMetadata } from '@nestjs/common';

export const ALLOWED_BUCKETS_KEY = 'allowedBuckets';

export const AllowedBuckets = (buckets: string[]) =>
  SetMetadata(ALLOWED_BUCKETS_KEY, buckets);
