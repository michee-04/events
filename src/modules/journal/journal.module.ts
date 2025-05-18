import { Module } from '@nestjs/common';

import { LibJournalModule } from '@app/journal';
import { JournalController } from './controllers/admin';

@Module({
  imports: [LibJournalModule],
  controllers: [JournalController],
})
export class ApiJournalModule {}
