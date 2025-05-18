import { ErrorResult, StringUtils } from '@app/common/utils';
import { JournalService } from '@app/journal/domain/services/journal.service';
import { RoleAssignmentService } from '@app/user-access-control/domain/services/roleAssignment.service';
import { RoleAssignment } from '@app/user-access-control/infrastructure/models/roleAssignment';
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
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { FilterQuery } from 'mongoose';
import { Admin } from '../../../core/decorators';
import {
  ApiEmptyDataResponse,
  ApiErrorResponse,
  ApiListQuery,
} from '../../../core/http';
import {
  ListRoleAssignmentsResponse,
  RoleAssignmentResponse,
  SetEntityRoleDto,
} from '../../dto';

@Admin()
@Controller('admin/role-assignments')
export class RoleAssignmentController {
  constructor(
    private readonly roleAssignmentService: RoleAssignmentService,
    private readonly journalService: JournalService,
  ) {}

  @ApiOperation({ summary: 'Lister les attributions de rôle avec pagination' })
  @ApiQuery({ type: ApiListQuery })
  @ApiResponse({ status: HttpStatus.OK, type: ListRoleAssignmentsResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Get()
  async list(@Req() req: Request) {
    try {
      const { limit, skip, query } = req.filterQuery;
      const filter: FilterQuery<RoleAssignment> = {};

      if (query) {
        if (StringUtils.isMongoId(query)) {
          filter.$or = [{ _id: query }, { roleId: query }];
        } else {
          filter.roleSlug = { $regex: query, $options: 'i' };
        }
      }

      const roleAssignments = await this.roleAssignmentService.get(
        filter,
        limit,
        skip,
      );
      return roleAssignments;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Récupérer une attribution de rôle' })
  @ApiResponse({ status: HttpStatus.OK, type: RoleAssignmentResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      const roleAssignment = await this.roleAssignmentService.getById(id, true);
      return roleAssignment;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({ summary: "Récupérer les attributions de rôle d'une entité" })
  @ApiResponse({ status: HttpStatus.OK, type: ListRoleAssignmentsResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Get('entity/:entityId')
  async listByUser(@Param('entityId') userId: string) {
    try {
      const roleAssignments =
        await this.roleAssignmentService.getAvailableByUser(userId);
      return roleAssignments;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Attribuer un rôle à une entité' })
  @ApiBody({ type: SetEntityRoleDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: RoleAssignmentResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Req() req: Request) {
    try {
      const input = new SetEntityRoleDto(req.body);

      const roleAssignment = await this.roleAssignmentService.create({
        ...input,
      });
      return roleAssignment;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({ summary: "Mettre à jour le rôle d'une entité" })
  @ApiBody({ type: SetEntityRoleDto })
  @ApiResponse({ status: HttpStatus.OK, type: RoleAssignmentResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(@Param('id') id: string, @Req() req: Request) {
    try {
      const input = new SetEntityRoleDto(req.body);

      const roleAssignment = await this.roleAssignmentService.update(id, {
        ...input,
      });
      return roleAssignment;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Activer ou désactiver une attribution de rôle' })
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
        await this.roleAssignmentService.activate(id);
      } else {
        await this.roleAssignmentService.deactivate(id);
      }

      return null;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Supprimer une attribution de rôle' })
  @ApiResponse({ status: HttpStatus.OK, type: ApiEmptyDataResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      await this.roleAssignmentService.delete(id);
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
