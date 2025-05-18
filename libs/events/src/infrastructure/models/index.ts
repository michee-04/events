import { ModelDefinition } from '@nestjs/mongoose';
import { Events, EventsSchema } from './events';

export const ModelsJournalProviders: ModelDefinition[] = [
  { name: Events.name, schema: EventsSchema },
];
