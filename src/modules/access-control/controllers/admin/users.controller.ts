import { ErrorResult, SearchFilter, StringUtils } from '@app/common/utils';
import { SortQuery } from '@app/core/providers/base.mongo.repository';
import { JournalService } from '@app/journal/domain/services/journal.service';
import { UserService } from '@app/user-access-control/domain/services/user.service';
import { User } from '@app/user-access-control/infrastructure/models/user';
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
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { FilterQuery } from 'mongoose';
import { Admin } from '../../../core/decorators';
import {
  ApiEmptyDataResponse,
  ApiErrorResponse,
  ApiListQuery,
} from '../../../core/http';
import { ListUsersResponse, UserResponse } from '../../dto';

@Admin()
@Controller('admin/users')
export class UserController {
  private readonly searchFilter: SearchFilter;

  constructor(
    private readonly userService: UserService,
    private readonly journalService: JournalService,
  ) {
    this.searchFilter = new SearchFilter({
      firstname: 'string',
      lastname: 'string',
      gender: 'string',
      email: 'string',
      phone: 'string',
    });
  }

  @ApiOperation({
    summary: 'Lister les utilisateurs avec pagination',
  })
  @ApiQuery({ type: ApiListQuery })
  @ApiResponse({ status: HttpStatus.OK, type: ListUsersResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Get()
  async list(@Req() req: Request) {
    try {
      const { limit, skip, query } = req.filterQuery;
      const filter: FilterQuery<User> = {};

      if (query) {
        if (StringUtils.isMongoId(query)) {
          filter._id = query;
        } else {
          const regex = { $regex: query, $options: 'i' };
          filter.$or = [
            { firstname: regex },
            { lastname: regex },
            { gender: regex },
            { email: regex },
            { phone: regex },
          ];
        }
      }

      const sort: SortQuery<User> = { email: 1 };
      const users = await this.userService.get(filter, limit, skip, sort);
      return users;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Recherche avancée des utilisateurs avec pagination',
  })
  @ApiResponse({ status: HttpStatus.OK, type: ListUsersResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Post('_search')
  async search(@Req() req: Request) {
    try {
      const { limit, skip } = req.filterQuery;
      const { filter = {}, sort = {} } = req.body;

      this.searchFilter.handle(filter, sort);

      const users = await this.userService.get(filter, limit, skip, sort);
      return users;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Récupérer un utilisateur' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      const user = await this.userService.getById(id, false, true);
      return user;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Activer ou désactiver un compte utilisateur',
  })
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
        await this.userService.activate(id);
      } else {
        await this.userService.deactivate(id);
      }

      return null;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiResponse({ status: HttpStatus.OK, type: ApiEmptyDataResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      await this.userService.delete(id);
      return null;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  private log(level: LogLevel, message?: string, data?: Record<string, any>) {
    this.journalService.save(
      'ApiAccessControlModule',
      this.constructor.name,
      level,
      message || 'Controller error',
      data,
    );
  }
}
