import { Module } from '@nestjs/common';
import { LibNotificationDomainModule } from './domain/domain.module';
import { LibNotificationInfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [LibNotificationDomainModule, LibNotificationInfrastructureModule],
  exports: [LibNotificationDomainModule, LibNotificationInfrastructureModule],
})
export class LibNotificationModule {}
