import { ModelDefinition } from '@nestjs/mongoose';
import { MinioFile, MinioFileSchema } from './minioFile';

export const ModelsJournalProviders: ModelDefinition[] = [
  { name: MinioFile.name, schema: MinioFileSchema },
];
