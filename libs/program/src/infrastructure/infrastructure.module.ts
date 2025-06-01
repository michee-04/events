import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MAIN_DATABASE_CONNECTION_NAME } from '@app/common/constants';
import { ModelsJournalProviders } from './models';
import { ProgrammeRepository } from './repositories/programme.repository';

@Module({
  imports: [
    MongooseModule.forFeature(
      ModelsJournalProviders,
      MAIN_DATABASE_CONNECTION_NAME,
    ),
  ],
  providers: [ProgrammeRepository],
  exports: [ProgrammeRepository],
})
export class LibProgrammeInfrastructureModule {}
