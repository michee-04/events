import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MAIN_DATABASE_CONNECTION_NAME } from '@app/common/constants';
import { ModelsJournalProviders } from './models';
import { EventsRepository } from './repositories/events.repository';

@Module({
  imports: [
    MongooseModule.forFeature(
      ModelsJournalProviders,
      MAIN_DATABASE_CONNECTION_NAME,
    ),
  ],
  providers: [EventsRepository],
  exports: [EventsRepository],
})
export class LibEventsInfrastructureModule {}
