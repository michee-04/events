import { Module } from '@nestjs/common';
import { LibEventsDomainModule } from './domain/domain.module';
import { LibEventsInfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [LibEventsDomainModule, LibEventsInfrastructureModule],
  exports: [LibEventsDomainModule, LibEventsInfrastructureModule],
})
export class LibEventsModule {}
