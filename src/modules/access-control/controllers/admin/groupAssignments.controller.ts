import { ErrorResult, StringUtils } from '@app/common/utils';
import { JournalService } from '@app/journal/domain/services/journal.service';
import { GroupAssignmentService } from '@app/user-access-control/domain/services/groupAssignment.service';
import { GroupAssignment } from '@app/user-access-control/infrastructure/models/groupAssignment';
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
  GroupAssignmentResponse,
  ListGroupAssignmentsResponse,
  SetEntityGroupDto,
} from '../../dto';

@Admin()
@ApiTags('ACL Admin - Group Assignments')
@Controller('admin/group-assignments')
export class GroupAssignmentController {
  constructor(
    private readonly groupAssignmentService: GroupAssignmentService,
    private readonly journalService: JournalService,
  ) {}

  @ApiOperation({
    summary: 'Lister les attributions de groupe avec pagination',
  })
  @ApiQuery({ type: ApiListQuery })
  @ApiResponse({ status: HttpStatus.OK, type: ListGroupAssignmentsResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Get()
  async list(@Req() req: Request) {
    try {
      const { limit, skip, query } = req.filterQuery;
      const filter: FilterQuery<GroupAssignment> = {};

      if (query) {
        if (StringUtils.isMongoId(query)) {
          filter.$or = [{ _id: query }, { groupId: query }];
        } else {
          filter.groupSlug = { $regex: query, $options: 'i' };
        }
      }

      const groupAssignments = await this.groupAssignmentService.get(
        filter,
        limit,
        skip,
      );
      return groupAssignments;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Récupérer une attribution de groupe' })
  @ApiResponse({ status: HttpStatus.OK, type: GroupAssignmentResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      const groupAssignment = await this.groupAssignmentService.getById(
        id,
        true,
      );
      return groupAssignment;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({
    summary: "Récupérer les attributions de groupe d'une entité",
  })
  @ApiResponse({ status: HttpStatus.OK, type: ListGroupAssignmentsResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Get('entity/:entityId')
  async listByUser(@Param('entityId') userId: string) {
    try {
      const groupAssignments =
        await this.groupAssignmentService.getAvailableByUser(userId);
      return groupAssignments;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Attribuer un groupe à une entité' })
  @ApiBody({ type: SetEntityGroupDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: GroupAssignmentResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Req() req: Request) {
    try {
      const input = new SetEntityGroupDto(req.body);

      const groupAssignment = await this.groupAssignmentService.create({
        ...input,
      });
      return groupAssignment;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({ summary: "Mettre à jour le groupe d'une entité" })
  @ApiBody({ type: SetEntityGroupDto })
  @ApiResponse({ status: HttpStatus.OK, type: GroupAssignmentResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(@Param('id') id: string, @Req() req: Request) {
    try {
      const input = new SetEntityGroupDto(req.body);

      const groupAssignment = await this.groupAssignmentService.update(id, {
        ...input,
      });
      return groupAssignment;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Activer ou désactiver une attribution de groupe' })
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
        await this.groupAssignmentService.activate(id);
      } else {
        await this.groupAssignmentService.deactivate(id);
      }

      return null;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Supprimer une attribution de groupe' })
  @ApiResponse({ status: HttpStatus.OK, type: ApiEmptyDataResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      await this.groupAssignmentService.delete(id);
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
