import { SetMetadata } from '@nestjs/common';

export const BUCKET_KEY = 'bucket';

export const Bucket = (bucket: string) => SetMetadata(BUCKET_KEY, bucket);
