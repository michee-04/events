import { ModelDefinition } from '@nestjs/mongoose';
import { Journal, JournalSchema } from './journal';

export const ModelsJournalProviders: ModelDefinition[] = [
  { name: Journal.name, schema: JournalSchema },
];
