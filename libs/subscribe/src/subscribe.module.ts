import { Module } from '@nestjs/common';
import { LibSubscribeDomainModule } from './domain/domain.module';
import { LibSubscribeInfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [LibSubscribeDomainModule, LibSubscribeInfrastructureModule],
  exports: [LibSubscribeDomainModule, LibSubscribeInfrastructureModule],
})
export class LibSubscribeModule {}
