import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { JOURNAL_DATABASE_CONNECTION_NAME } from '@app/common/constants';
import { ModelsJournalProviders } from './models';
import { JournalRepository } from './repositories/journal.repository';

@Module({
  imports: [
    MongooseModule.forFeature(
      ModelsJournalProviders,
      JOURNAL_DATABASE_CONNECTION_NAME,
    ),
  ],
  providers: [JournalRepository],
  exports: [JournalRepository],
})
export class LibJournalInfrastructureModule {}
