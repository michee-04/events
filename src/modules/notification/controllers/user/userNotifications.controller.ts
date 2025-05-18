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

import { JournalService } from '@app/journal/domain/services/journal.service';
import { UserNotificationService } from '@app/notification/domain/services/userNotification.service';
import { UserNotificationRepository } from '@app/notification/infrastructure/repositories/userNotification.repository';
import {
  ApiEmptyDataResponse,
  ApiErrorResponse,
  ApiListQuery,
} from '../../../core/http';
import {
  ListUserNotificationsResponse,
  UserNotificationResponse,
} from '../../dtos';

@ApiTags('Notification User - User Notifications')
@Controller('notification/user-notifications')
export class UserNotificationController {
  constructor(
    private readonly userNotificationRepository: UserNotificationRepository,
    private readonly userNotificationService: UserNotificationService,
    private readonly journalService: JournalService,
  ) {}

  @ApiOperation({
    summary:
      "Lister les notifications de l'utilisateur connecté avec pagination",
  })
  @ApiQuery({ type: ApiListQuery })
  @ApiResponse({ status: HttpStatus.OK, type: ListUserNotificationsResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Get()
  async list(@Req() req: Request) {
    try {
      const { limit, skip } = req.filterQuery;

      const notifications = await this.userNotificationRepository.get(
        { userId: req.user!._id, deleted: false },
        limit,
        skip,
        { createdAt: -1 },
      );
      return notifications;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({
    summary: "Lister toutes les notifications de l'utilisateur connecté",
  })
  @ApiResponse({ status: HttpStatus.OK, type: ListUserNotificationsResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Get('_all')
  async listAll(@Req() req: Request) {
    try {
      const notifications = await this.userNotificationRepository.getAll(
        { userId: req.user!._id, deleted: false },
        { createdAt: -1 },
      );
      return notifications;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({
    summary: "Récupérer une notification de l'utilisateur connecté",
  })
  @ApiResponse({ status: HttpStatus.OK, type: UserNotificationResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getById(@Param('id') id: string, @Req() req: Request) {
    try {
      const template = await this.userNotificationService.getById(
        id,
        req.user!._id.toString(),
        true,
      );
      return template;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({
    summary: "Supprimer une notification de l'utilisateur connecté",
  })
  @ApiResponse({ status: HttpStatus.OK, type: ApiEmptyDataResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request) {
    try {
      await this.userNotificationService.delete(id, req.user!._id.toString());
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
