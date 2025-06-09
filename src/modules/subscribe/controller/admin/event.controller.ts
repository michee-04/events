/* eslint-disable @typescript-eslint/no-unused-vars */
import { SearchFilter, StringUtils } from '@app/common/utils';
import { FilterQuery } from '@app/core/providers/base.mongo.repository';
import { EventsService } from '@app/events/domain/services/events.service';
import { Events } from '@app/events/infrastructure/models/events';
import { EventsRepository } from '@app/events/infrastructure/repositories/events.repository';
import { JournalService } from '@app/journal/domain/services/journal.service';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  LogLevel,
  Param,
  Post,
  Put,
  Req,
  Res,
  StreamableFile,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Admin } from 'src/modules/core/decorators';
import { FileUploadInterceptor } from 'src/modules/core/interceptors/file-upload.interceptor';
import { CreateEventDto } from '../../dto';
import { UpdateEventDto } from '../../dto/request/update-event.request.dto';

@Admin()
@Controller('admin/event')
export class AdminEventController {
  private readonly searchFilter: SearchFilter;

  constructor(
    private readonly eventService: EventsService,
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

  @HttpCode(HttpStatus.CREATED)
  @Post('')
  @UseInterceptors(FileUploadInterceptor)
  async createEvent(@Req() req: Request) {
    try {
      const { body, uploadedFile } = req;
      const input = new CreateEventDto(body);

      const result = await this.eventService.createEvent(
        { ...input },
        uploadedFile!,
      );

      return result;
    } catch (error) {
      throw error;
    }
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
  @Put('/:id')
  async updateEvent(@Param('id') id: string, @Req() req: Request) {
    try {
      const input = new UpdateEventDto(req.body);

      const result = await this.eventService.updateEvent(id, { ...input });

      return result;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/:id')
  async deleteEevnt(@Param('id') id: string) {
    try {
      await this.eventService.deleteEvent(id);
      return null;
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
