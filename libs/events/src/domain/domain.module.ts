import { LibFileStorageDomainModule } from '@app/file-storage/domain/domain.module';
import { LibFileStorageInfrastructureModule } from '@app/file-storage/infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';
import { LibEventsInfrastructureModule } from '../infrastructure/infrastructure.module';
import { EventsService } from './services/events.service';

@Module({
  imports: [
    LibEventsInfrastructureModule,
    LibFileStorageDomainModule,
    LibFileStorageInfrastructureModule,
  ],
  providers: [EventsService],
  exports: [EventsService],
})
export class LibEventsDomainModule {}
