import { Module } from '@nestjs/common';
import { LibFileStorageInfrastructureModule } from '../infrastructure/infrastructure.module';
import { FileService } from './services/file.service';

@Module({
  imports: [LibFileStorageInfrastructureModule],
  providers: [FileService],
  exports: [FileService],
})
export class LibFileStorageDomainModule {}
