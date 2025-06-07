import { Module } from '@nestjs/common';
import { LibFileStorageDomainModule } from './domain/domain.module';
import { LibFileStorageInfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [LibFileStorageDomainModule, LibFileStorageInfrastructureModule],
  exports: [LibFileStorageDomainModule, LibFileStorageInfrastructureModule],
})
export class LibFileStorageModule {}
