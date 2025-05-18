import { ErrorResult, SearchFilter, StringUtils } from '@app/common/utils';
import { JournalService } from '@app/journal/domain/services/journal.service';
import { EmailTemplateService } from '@app/notification/domain/services/emailTemplate.service';
import { EmailTemplate } from '@app/notification/infrastructure/models/emailTemplate';
import { EmailTemplateRepository } from '@app/notification/infrastructure/repositories/emailTemplate.repository';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  LogLevel,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { FilterQuery } from 'mongoose';
import { Admin } from '../../../core/decorators';
import {
  ApiEmptyDataResponse,
  ApiErrorResponse,
  ApiListQuery,
} from '../../../core/http';
import {
  EmailTemplateResponse,
  ListEmailTemplatesResponse,
  UpsertEmailTemplateDto,
} from '../../dtos';

@Admin()
@ApiTags('Notification Admin - Email Templates')
@Controller('admin/notification/email-templates')
export class AdminEmailTemplateController {
  private readonly searchFilter: SearchFilter;

  constructor(
    private readonly emailTemplateRepository: EmailTemplateRepository,
    private readonly emailTemplateService: EmailTemplateService,
    private readonly journalService: JournalService,
  ) {
    this.searchFilter = new SearchFilter({
      label: 'string',
      description: 'string',
      slug: 'string',
      subject: 'string',
      template: 'string',
      message: 'string',
    });
  }

  @ApiOperation({ summary: "Lister les modèles d'email avec pagination" })
  @ApiQuery({ type: ApiListQuery })
  @ApiResponse({ status: HttpStatus.OK, type: ListEmailTemplatesResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Get()
  async list(@Req() req: Request) {
    try {
      const { limit, skip, query } = req.filterQuery;
      const filter: FilterQuery<EmailTemplate> = {};

      if (query) {
        if (StringUtils.isMongoId(query)) {
          filter._id = query;
        } else {
          const regex = { $regex: query, $options: 'i' };
          filter.$or = [
            { label: regex },
            { subject: regex },
            { slug: regex },
            { description: regex },
          ];
        }
      }

      filter.deleted = false;

      const templates = await this.emailTemplateRepository.get(
        filter,
        limit,
        skip,
      );
      return templates;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({ summary: "Lister tous les modèles d'email" })
  @ApiResponse({ status: HttpStatus.OK, type: ListEmailTemplatesResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Get('_all')
  async listAll() {
    try {
      const templates = await this.emailTemplateRepository.getAll({
        deleted: false,
      });
      return templates;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({
    summary: "Recherche avancée des modèles d'email avec pagination",
  })
  @ApiResponse({ status: HttpStatus.OK, type: ListEmailTemplatesResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Post('_search')
  async search(@Req() req: Request) {
    try {
      const { limit, skip } = req.filterQuery;
      const { filter = {}, sort = {} } = req.body;

      this.searchFilter.handle(filter, sort);
      filter.deleted = false;

      const templates = await this.emailTemplateRepository.get(
        filter,
        limit,
        skip,
        sort,
      );
      return templates;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({ summary: "Récupérer un modèle d'email" })
  @ApiResponse({ status: HttpStatus.OK, type: EmailTemplateResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      const template = await this.emailTemplateService.getById(id, true);
      return template;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({ summary: "Créer un modèle d'email" })
  @ApiBody({ type: UpsertEmailTemplateDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: EmailTemplateResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Req() req: Request) {
    try {
      const input = new UpsertEmailTemplateDto(req.body);

      const template = await this.emailTemplateService.create({ ...input });
      return template;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({ summary: "Mettre à jour un modèle d'email" })
  @ApiBody({ type: UpsertEmailTemplateDto })
  @ApiResponse({ status: HttpStatus.OK, type: EmailTemplateResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(@Param('id') id: string, @Req() req: Request) {
    try {
      const input = new UpsertEmailTemplateDto(req.body);

      const template = await this.emailTemplateService.update(id, {
        ...input,
      });
      return template;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({ summary: "Activer ou désactiver un modèle d'email" })
  @ApiQuery({ name: 'state', enum: ['on', 'off'], example: 'on' })
  @ApiResponse({ status: HttpStatus.OK, type: ApiEmptyDataResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Patch(':id/toggle-state')
  async toggleState(@Param('id') id: string, @Query('state') state?: string) {
    try {
      if (!['on', 'off'].includes(state || '')) {
        throw new ErrorResult({
          code: 400_020,
          clean_message: "L'état est invalide",
          message:
            "Le paramètre de requête [state] doit avoir pour valeur 'on' ou 'off'",
        });
      }

      if (state === 'on') {
        await this.emailTemplateService.activate(id);
      } else {
        await this.emailTemplateService.deactivate(id);
      }

      return null;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({ summary: "Supprimer un modèle d'email" })
  @ApiResponse({ status: HttpStatus.OK, type: ApiEmptyDataResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      await this.emailTemplateService.delete(id);
      return null;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  private log(level: LogLevel, message?: string, data?: Record<string, any>) {
    this.journalService.save(
      'ApiNotificationModule',
      this.constructor.name,
      level,
      message || 'Controller error',
      data,
    );
  }
}
