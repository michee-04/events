import { Module } from '@nestjs/common';
import { LibUserAccessControlDomainModule } from './domain/domain.module';
import { LibUserAccessControlInfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [
    LibUserAccessControlDomainModule,
    LibUserAccessControlInfrastructureModule,
  ],
  exports: [
    LibUserAccessControlDomainModule,
    LibUserAccessControlInfrastructureModule,
  ],
})
export class LibUserAccessControlModule {}
