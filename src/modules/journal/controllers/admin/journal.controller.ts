import { StringUtils } from '@app/common/utils';
import { JournalService } from '@app/journal/domain/services/journal.service';
import { Journal } from '@app/journal/infrastructure/models/journal';
import { JournalRepository } from '@app/journal/infrastructure/repositories/journal.repository';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  LogLevel,
  Param,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { FilterQuery } from 'mongoose';
import { Admin } from '../../../core/decorators';
import {
  ApiEmptyDataResponse,
  ApiErrorResponse,
  ApiListQuery,
} from '../../../core/http';
import { ListJournalsResponse } from '../../dtos';

@Admin()
@ApiTags('Journal Admin - Logs')
@Controller('admin/journal/logs')
export class JournalController {
  constructor(
    private readonly journalRepository: JournalRepository,
    private readonly journalService: JournalService,
  ) {}

  @ApiOperation({ summary: 'Lister les logs du journal avec pagination' })
  @ApiQuery({ type: ApiListQuery })
  @ApiResponse({ status: HttpStatus.OK, type: ListJournalsResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Get()
  async list(@Req() req: Request) {
    try {
      const { limit, skip, query } = req.filterQuery;
      const filter: FilterQuery<Journal> = {};

      if (query) {
        if (StringUtils.isMongoId(query)) {
          filter._id = query;
        } else {
          const regex = { $regex: query, $options: 'i' };
          filter.$or = [{ level: regex }, { message: regex }];
        }
      }

      filter.deleted = false;

      const logs = await this.journalRepository.get(filter, limit, skip);
      return logs;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Supprimer un log du journal' })
  @ApiResponse({ status: HttpStatus.OK, type: ApiEmptyDataResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      await this.journalService.delete(id);
      return null;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  private log(level: LogLevel, message?: string, data?: Record<string, any>) {
    this.journalService.save(
      'ApiJournalModule',
      this.constructor.name,
      level,
      message || 'Controller error',
      data,
    );
  }
}
