import { LibEventsModule } from '@app/events';
import { LibJournalModule } from '@app/journal';
import { Module } from '@nestjs/common';
import { EventController } from './controller';

@Module({
  imports: [LibEventsModule, LibJournalModule],
  controllers: [EventController],
})
export class ApiEventModule {}
