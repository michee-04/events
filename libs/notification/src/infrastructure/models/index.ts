import { ModelDefinition } from '@nestjs/mongoose';

import { EmailTemplate, EmailTemplateSchema } from './emailTemplate';
import { UserNotification, UserNotificationSchema } from './userNotification';

export const ModelsMainProviders: ModelDefinition[] = [
  { name: EmailTemplate.name, schema: EmailTemplateSchema },
  { name: UserNotification.name, schema: UserNotificationSchema },
];
