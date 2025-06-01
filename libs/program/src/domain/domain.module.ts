import { LibEventsInfrastructureModule } from '@app/events/infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';
import { LibProgrammeInfrastructureModule } from '../infrastructure/infrastructure.module';
import { ProgrammeService } from './services/programme.service';

@Module({
  imports: [LibEventsInfrastructureModule, LibProgrammeInfrastructureModule],
  providers: [ProgrammeService],
  exports: [ProgrammeService],
})
export class LibProgrammeDomainModule {}
