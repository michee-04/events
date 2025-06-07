import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MAIN_DATABASE_CONNECTION_NAME } from '@app/common/constants';
import { ModelsJournalProviders } from './models';
import { MinioFileRepository } from './repositories/minioFile.repository';

@Module({
  imports: [
    MongooseModule.forFeature(
      ModelsJournalProviders,
      MAIN_DATABASE_CONNECTION_NAME,
    ),
  ],
  providers: [MinioFileRepository],
  exports: [MinioFileRepository],
})
export class LibFileStorageInfrastructureModule {}
