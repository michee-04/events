import { LibJournalModule } from '@app/journal';
import { LibProgramModule } from '@app/program';
import { Module } from '@nestjs/common';
import { AdminProgrammeController, ProgrammeController } from './controller';

@Module({
  imports: [LibProgramModule, LibJournalModule],
  controllers: [AdminProgrammeController, ProgrammeController],
})
export class ApiProgramModule {}
