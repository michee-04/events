import { LibEventsModule } from '@app/events';
import { LibFileStorageModule } from '@app/file-storage';
import { LibJournalModule } from '@app/journal';
import { Module } from '@nestjs/common';
import { AdminEventController, EventController } from './controller';

@Module({
  imports: [LibEventsModule, LibJournalModule, LibFileStorageModule],
  controllers: [AdminEventController, EventController],
})
export class ApiEventModule {}
