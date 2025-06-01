/* eslint-disable @typescript-eslint/no-unused-vars */
import { SearchFilter, StringUtils } from '@app/common/utils';
import { FilterQuery } from '@app/core/providers/base.mongo.repository';
import { JournalService } from '@app/journal/domain/services/journal.service';
import { ProgrammeService } from '@app/program/domain/services/programme.service';
import { Programme } from '@app/program/infrastructure/models/program';
import { ProgrammeRepository } from '@app/program/infrastructure/repositories/programme.repository';
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
} from '@nestjs/common';
import { Request } from 'express';
import { Admin } from 'src/modules/core/decorators';
import { CreateProgrammeDto } from '../../dto';
import { UpdateProgrammeDto } from '../../dto/request/update-programme.request.dto';

@Admin()
@Controller('admin/programme')
export class AdminProgrammeController {
  private readonly searchFilter: SearchFilter;

  constructor(
    private readonly programmeService: ProgrammeService,
    private readonly programmeRepository: ProgrammeRepository,
    private readonly journalService: JournalService,
  ) {
    this.searchFilter = new SearchFilter({
      title: 'string',
      speaker: 'string',
    });
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('')
  async createProgram(@Req() req: Request) {
    try {
      const input = new CreateProgrammeDto(req.body);

      const result = await this.programmeService.createProgramme({ ...input });

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
      const filter: FilterQuery<Programme> = {};

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

      const events = await this.programmeRepository.get(filter, limit, skip, {
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

      const events = await this.programmeService.get(filter, limit, skip, sort);

      return events;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Put('/:id')
  async updateProgramme(@Param('id') id: string, @Req() req: Request) {
    try {
      const input = new UpdateProgrammeDto(req.body);

      const result = await this.programmeService.updateProgramme(id, {
        ...input,
      });

      return result;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/:id')
  async deleteProgramme(@Param('id') id: string) {
    try {
      await this.programmeService.deleteProgramme(id);
      return null;
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
