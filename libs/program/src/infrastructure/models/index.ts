import { ModelDefinition } from '@nestjs/mongoose';
import { Programme, ProgrammeSchema } from './program';

export const ModelsJournalProviders: ModelDefinition[] = [
  { name: Programme.name, schema: ProgrammeSchema },
];
