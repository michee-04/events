import { SearchFilter, StringUtils } from '@app/common/utils';
import { FilterQuery } from '@app/core/providers/base.mongo.repository';
import { EventsService } from '@app/events/domain/services/events.service';
import { Events } from '@app/events/infrastructure/models/events';
import { EventsRepository } from '@app/events/infrastructure/repositories/events.repository';
import { JournalService } from '@app/journal/domain/services/journal.service';
import { SubscribeService } from '@app/subscribe/domain/services/subscribe.service';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  LogLevel,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeSessionDto } from '../../dto/request/confirm-payment.request';

@Controller('user/event')
export class EventController {
  private readonly searchFilter: SearchFilter;

  constructor(
    private readonly eventService: EventsService,
    private readonly subscribeService: SubscribeService,

    private readonly eventsRepository: EventsRepository,
    private readonly journalService: JournalService,
  ) {
    this.searchFilter = new SearchFilter({
      title: 'string',
      description: 'string',
      location: 'string',
      capacity: 'number',
      isOnline: 'boolean',
      tags: 'string',
    });
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async list(@Req() req: Request) {
    try {
      const { limit, skip, query } = req.filterQuery;
      const filter: FilterQuery<Events> = {};

      if (query) {
        const numQuery = Number(query);
        if (StringUtils.isMongoId(query)) {
          filter._id = query;
        } else if (!Number.isNaN(numQuery)) {
          filter.$or = [{ min: numQuery }, { max: numQuery }];
        } else {
          const regex = { $regex: query, $options: 'i' };
          filter.$or = [
            { title: regex },
            { description: regex },
            { location: regex },
            { tags: regex },
          ];
        }
      }

      filter.deleted = false;

      const events = await this.eventsRepository.get(filter, limit, skip, {
        name: 1,
      });
      return events;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('_search')
  async search(@Req() req: Request) {
    try {
      const { limit, skip } = req.filterQuery;
      const { filter = {}, sort = {} } = req.body;

      this.searchFilter.handle(filter, sort);

      const events = await this.eventService.get(filter, limit, skip, sort);

      return events;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id/download')
  async getFIle(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.eventService.downloadFile(id);

      res.set({
        'Content-Type': result.mimetype,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(result.originalName)}"`,
      });

      return result.stream.pipe(res);
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/subscribe')
  async subscribe(@Req() req: Request, @Param('id') id: string) {
    try {
      const user = req.user;

      const result = await this.subscribeService.subscribe(user, id);

      return result;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('confirm-payment')
  async ConfirmPayment(@Req() req: Request) {
    try {
      const { body, user } = req;

      const payload = new StripeSessionDto(body);

      const result = await this.subscribeService.confirmPaidSubscription(
        { ...payload },
        user,
      );

      return result;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  private log(level: LogLevel, message?: string, data?: Record<string, any>) {
    this.journalService.save(
      'ApiEventModule',
      this.constructor.name,
      level,
      message || 'Controller error',
      data,
    );
  }
}
