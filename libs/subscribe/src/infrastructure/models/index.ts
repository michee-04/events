import { ModelDefinition } from '@nestjs/mongoose';
import { Subscribe, SubscribeSchema } from './subscribe';

export const ModelsJournalProviders: ModelDefinition[] = [
  { name: Subscribe.name, schema: SubscribeSchema },
];
