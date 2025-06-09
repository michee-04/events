import { LibEventsModule } from '@app/events';
import { LibFileStorageModule } from '@app/file-storage';
import { LibJournalModule } from '@app/journal';
import { LibSubscribeModule } from '@app/subscribe';
import { Module } from '@nestjs/common';
import { AdminEventController, EventController } from './controller';

@Module({
  imports: [
    LibEventsModule,
    LibJournalModule,
    LibFileStorageModule,
    LibSubscribeModule,
  ],
  controllers: [AdminEventController, EventController],
})
export class ApiEventModule {}
