import { LibEventsModule } from '@app/events';
import { LibJournalModule } from '@app/journal';
import { Module } from '@nestjs/common';
import { AdminEventController, EventController } from './controller';

@Module({
  imports: [LibEventsModule, LibJournalModule],
  controllers: [AdminEventController, EventController],
})
export class ApiEventModule {}
