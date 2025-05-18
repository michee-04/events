/* eslint-disable @typescript-eslint/no-unused-vars */
import { EventsService } from '@app/events/domain/services/events.service';
import { JournalService } from '@app/journal/domain/services/journal.service';
import {
  Controller,
  HttpCode,
  HttpStatus,
  LogLevel,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Admin } from 'src/modules/core/decorators';
import { CreateEventDto } from '../../dto';

@Admin()
@Controller('admin/event')
export class EventController {
  constructor(
    private readonly eventService: EventsService,
    private readonly journalService: JournalService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('')
  async createEvent(@Req() req: Request) {
    try {
      const input = new CreateEventDto(req.body);

      const result = await this.eventService.createEvent({ ...input });
    } catch (error) {
      throw error;
    }
  }

  private log(level: LogLevel, message?: string, data?: Record<string, any>) {
    this.journalService.save(
      'ApiAuthModule',
      this.constructor.name,
      level,
      message || 'Controller error',
      data,
    );
  }
}
