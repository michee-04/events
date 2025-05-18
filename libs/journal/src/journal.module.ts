import { Module } from '@nestjs/common';

import { LibJournalDomainModule } from './domain/domain.module';
import { LibJournalInfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [LibJournalDomainModule, LibJournalInfrastructureModule],
  exports: [LibJournalDomainModule, LibJournalInfrastructureModule],
})
export class LibJournalModule {}
