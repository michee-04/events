import { Injectable } from '@nestjs/common';

import { ErrorResult } from '@app/common/utils';
import {
  LeanedDocument,
  SortQuery,
} from '@app/core/providers/base.mongo.repository';
import { FilterQuery } from 'mongoose';
import { RoleAssignment } from '../../infrastructure/models/roleAssignment';
import { RoleRepository } from '../../infrastructure/repositories/role.repository';
import { RoleAssignmentRepository } from '../../infrastructure/repositories/roleAssigment.repository';
import { UserRepository } from '../../infrastructure/repositories/user.repository';

@Injectable()
export class RoleAssignmentService {
  constructor(
    private readonly roleAssignmentRepository: RoleAssignmentRepository,
    private readonly roleRepository: RoleRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async create(input: Partial<RoleAssignment>) {
    let roleAssignment = await this.roleAssignmentRepository.getOne({
      userId: input.userId,
      roleId: input.roleId,
      deleted: false,
    });

    if (!roleAssignment) {
      await this.validateData(input);
      roleAssignment = await this.roleAssignmentRepository.create(input);
    }

    return roleAssignment;
  }

  async update(id: string, data: Partial<RoleAssignment>) {
    const roleAssignment = await this.getById(id, false, false);
    Object.assign(roleAssignment, { ...data });

    return this.roleAssignmentRepository.update(roleAssignment);
  }

  async delete(id: string) {
    const roleAssignment = await this.getById(id);

    roleAssignment.active = false;
    roleAssignment.deleted = true;
    roleAssignment.deletedAt = new Date();

    return this.roleAssignmentRepository.update(roleAssignment);
  }

  async getById(id: string, active = false, showMetadata = true) {
    let roleAssignment: LeanedDocument<RoleAssignment> | null = null;

    if (active) {
      roleAssignment =
        await this.roleAssignmentRepository.getNotDeletedById(id);
    } else {
      roleAssignment = await this.roleAssignmentRepository.getById(id);
    }

    if (!roleAssignment) {
      throw new ErrorResult({
        code: 404_015,
        clean_message: "L'assignation de rôle est introuvable",
        message: `L'assignation de rôle [${id}] est introuvable`,
      });
    }

    if (showMetadata) {
      roleAssignment.data = await this.getMetadata(roleAssignment);
    }

    return roleAssignment;
  }

  async get(
    filter: FilterQuery<RoleAssignment> = {},
    limit = 20,
    skip = 0,
    sort: SortQuery<RoleAssignment> = {},
  ) {
    const roleAssignments = await this.roleAssignmentRepository.get(
      { ...filter, deleted: false },
      limit,
      skip,
      sort,
    );

    for (const roleAssignment of roleAssignments) {
      roleAssignment.data = await this.getMetadata(roleAssignment);
    }

    return roleAssignments;
  }

  async getByUser(userId: string) {
    const roleAssignments = await this.roleAssignmentRepository.getAll({
      userId,
      deleted: false,
    });

    for (const roleAssignment of roleAssignments) {
      roleAssignment.data = await this.getMetadata(roleAssignment);
    }

    return roleAssignments;
  }

  async getAvailableByUser(userId: string) {
    const roleAssignments = await this.roleAssignmentRepository.getAll({
      userId,
      active: true,
      deleted: false,
    });

    for (const roleAssignment of roleAssignments) {
      roleAssignment.data = await this.getMetadata(roleAssignment);
    }

    return roleAssignments;
  }

  async activate(id: string) {
    const roleAssignment = await this.getById(id);
    if (!roleAssignment.active && !roleAssignment.deleted) {
      roleAssignment.active = true;
      await this.roleAssignmentRepository.update(roleAssignment);
    }

    return roleAssignment;
  }

  async deactivate(id: string) {
    const roleAssignment = await this.getById(id);
    if (roleAssignment.active && !roleAssignment.deleted) {
      roleAssignment.active = false;
      await this.roleAssignmentRepository.update(roleAssignment);
    }

    return roleAssignment;
  }

  private async getMetadata(roleAssignment: LeanedDocument<RoleAssignment>) {
    const [role, user] = await Promise.all([
      this.roleRepository.getById(roleAssignment.roleId),
      this.userRepository.getById(roleAssignment.userId),
    ]);

    return { role, user };
  }

  private async validateData(data: Partial<RoleAssignment>) {
    const { roleId, userId } = data;

    if (roleId) {
      const role = await this.roleRepository.getById(roleId);
      if (!role) {
        throw new ErrorResult({
          code: 404_012,
          clean_message: 'Le rôle est introuvable',
          message: `Le rôle [${roleId}] est introuvable`,
        });
      }
      Object.assign(data, { roleSlug: role.slug });
    }

    if (userId) {
      const user = await this.userRepository.getById(userId);
      if (!user) {
        throw new ErrorResult({
          code: 404_010,
          clean_message: "L'entité est introuvable",
          message: `L'entité [${userId}] est introuvable`,
        });
      }
    }
  }
}
