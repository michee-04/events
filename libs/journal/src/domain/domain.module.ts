import { Module } from '@nestjs/common';

import { LibJournalInfrastructureModule } from '../infrastructure/infrastructure.module';
import { JournalService } from './services/journal.service';

@Module({
  imports: [LibJournalInfrastructureModule],
  providers: [JournalService],
  exports: [JournalService],
})
export class LibJournalDomainModule {}
