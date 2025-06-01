import { Module } from '@nestjs/common';
import { LibProgrammeDomainModule } from './domain/domain.module';
import { LibProgrammeInfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [LibProgrammeDomainModule, LibProgrammeInfrastructureModule],
  exports: [LibProgrammeDomainModule, LibProgrammeInfrastructureModule],
})
export class LibProgramModule {}
