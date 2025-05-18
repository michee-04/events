import { Module } from '@nestjs/common';
import { LibEventsInfrastructureModule } from '../infrastructure/infrastructure.module';
import { EventsService } from './services/events.service';

@Module({
  imports: [LibEventsInfrastructureModule],
  providers: [EventsService],
  exports: [EventsService],
})
export class LibEventsDomainModule {}
