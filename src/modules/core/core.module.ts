import { LibJournalModule } from '@app/journal';
import { LibUserAccessControlDomainModule } from '@app/user-access-control/domain/domain.module';
import { LibUserAccessControlInfrastructureModule } from '@app/user-access-control/infrastructure/infrastructure.module';
import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ExpectionHandlerFilter } from './exceptions';
import { AuthGuard } from './guards';
import { ResponseTransformerInterceptor } from './interceptors/response/transformer';
import { ResponseValidationInterceptor } from './interceptors/response/validator';
import { WinstonLogger } from './services/logger/winston';

@Module({
  imports: [
    LibUserAccessControlInfrastructureModule,
    LibUserAccessControlDomainModule,
    LibJournalModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },

    { provide: APP_INTERCEPTOR, useClass: ResponseTransformerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseValidationInterceptor },
    { provide: APP_FILTER, useClass: ExpectionHandlerFilter },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    },
    WinstonLogger,
    ExpectionHandlerFilter,
  ],
})
export class ApiCoreModule {}
