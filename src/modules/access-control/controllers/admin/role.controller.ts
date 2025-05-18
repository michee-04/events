/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorResult, SearchFilter, StringUtils } from '@app/common/utils';
import { JournalService } from '@app/journal/domain/services/journal.service';
import { RoleService } from '@app/user-access-control/domain/services/role.service';
import { Role } from '@app/user-access-control/infrastructure/models/role';
import { GroupRepository } from '@app/user-access-control/infrastructure/repositories/group.repository';
import { RoleRepository } from '@app/user-access-control/infrastructure/repositories/role.repository';
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
import { Request } from 'express';
import { FilterQuery } from 'mongoose';
import { Admin } from 'src/modules/core/decorators';
import { UpsertRoleDto } from '../../dto';

@Admin()
@Controller('admin/role')
export class RoleController {
  private readonly searchFIlter: SearchFilter;

  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly groupRepository: GroupRepository,
    private readonly roleService: RoleService,
    private readonly journalService: JournalService,
  ) {
    this.searchFIlter = new SearchFilter({
      label: 'string',
      slug: 'string',
      description: 'string',
    });
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async list(@Req() req: Request) {
    try {
      const { limit, skip, query } = req.filterQuery;

      const filter: FilterQuery<Role> = {};

      if (query) {
        if (StringUtils.isMongoId(query)) {
          filter._id = query;
        }
      } else {
        const regex = { $regex: query, $options: 'i' };

        filter.$or = [
          { label: regex },
          { slug: regex },
          { description: regex },
        ];
      }

      filter.deleted = false;

      const role = await this.roleRepository.get(filter, limit, skip);
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('_search')
  async search(@Req() req: Request) {
    try {
      //
      const { limit, skip } = req.filterQuery;
      const { filter = {}, sort = {} } = req.body;

      this.searchFIlter.handle(filter, sort);
      filter.deleted = false;

      const roles = await this.roleRepository.get(filter, limit, skip, sort);
      return roles;
    } catch (error) {
      this.log('error', '', error);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async getById(@Param('id') id: string) {
    try {
      const role = await this.roleService.getById(id, true);

      return role;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Req() req: Request) {
    try {
      const input = new UpsertRoleDto(req.body);

      const role = await this.roleService.create({ ...input });
      return role;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(@Param('id') id: string, @Req() req: Request) {
    try {
      const input = new UpsertRoleDto(req.body);

      const role = await this.roleService.update(id, { ...input });
      return role;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

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
        await this.roleService.activate(id);
      } else {
        await this.roleService.deactivate(id);
      }

      return null;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      await this.roleService.delete(id);
      return null;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id/groups')
  async listGroups(@Param('id') id: string) {
    try {
      await this.roleService.getById(id);
      const groups = await this.groupRepository.getAll({ roles: id });
      return groups;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  private log(level: LogLevel, message?: string, data?: Record<string, any>) {
    this.journalService.save(
      'ApiUserAccessControlModule',
      this.constructor.name,
      level,
      message || 'controller error',
      data,
    );
  }
}
