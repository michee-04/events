import { ErrorResult } from '@app/common/utils';
import {
  LeanedDocument,
  SortQuery,
} from '@app/core/providers/base.mongo.repository';
import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { GroupAssignment } from '../../infrastructure/models/groupAssignment';
import { GroupRepository } from '../../infrastructure/repositories/group.repository';
import { GroupAssignmentRepository } from '../../infrastructure/repositories/groupAssigment.repository';
import { UserRepository } from '../../infrastructure/repositories/user.repository';

@Injectable()
export class GroupAssignmentService {
  constructor(
    private readonly groupAssignmentRepository: GroupAssignmentRepository,
    private readonly groupRepository: GroupRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async create(input: Partial<GroupAssignment>) {
    let groupAssignment = await this.groupAssignmentRepository.getOne({
      userId: input.userId,
      groupId: input.groupId,
      deleted: false,
    });

    if (!groupAssignment) {
      await this.validateData(input);
      groupAssignment = await this.groupAssignmentRepository.create(input);
    }

    return groupAssignment;
  }

  async update(id: string, data: Partial<GroupAssignment>) {
    const groupAssignment = await this.getById(id, false, false);
    Object.assign(groupAssignment, { ...data });

    return this.groupAssignmentRepository.update(groupAssignment);
  }

  async delete(id: string) {
    const groupAssignment = await this.getById(id);

    groupAssignment.active = false;
    groupAssignment.deleted = true;
    groupAssignment.deletedAt = new Date();

    return this.groupAssignmentRepository.update(groupAssignment);
  }

  async getById(id: string, active = false, showMetadata = true) {
    let groupAssignment: LeanedDocument<GroupAssignment> | null = null;

    if (active) {
      groupAssignment =
        await this.groupAssignmentRepository.getNotDeletedById(id);
    } else {
      groupAssignment = await this.groupAssignmentRepository.getById(id);
    }

    if (!groupAssignment) {
      throw new ErrorResult({
        code: 404_014,
        clean_message: "L'assignation de groupe est introuvable",
        message: `L'assignation de groupe [${id}] est introuvable`,
      });
    }

    if (showMetadata) {
      groupAssignment.data = await this.getMetadata(groupAssignment);
    }

    return groupAssignment;
  }

  async get(
    filter: FilterQuery<GroupAssignment> = {},
    limit = 20,
    skip = 0,
    sort: SortQuery<GroupAssignment> = {},
  ) {
    const groupAssignments = await this.groupAssignmentRepository.get(
      { ...filter, deleted: false },
      limit,
      skip,
      sort,
    );

    for (const groupAssignment of groupAssignments) {
      groupAssignment.data = await this.getMetadata(groupAssignment);
    }

    return groupAssignments;
  }

  async getByUser(userId: string) {
    const groupAssignments = await this.groupAssignmentRepository.getAll({
      userId,
      deleted: false,
    });

    for (const groupAssignment of groupAssignments) {
      groupAssignment.data = await this.getMetadata(groupAssignment);
    }

    return groupAssignments;
  }

  async getAvailableByUser(userId: string) {
    const groupAssignments = await this.groupAssignmentRepository.getAll({
      userId,
      active: true,
      deleted: false,
    });

    for (const groupAssignment of groupAssignments) {
      groupAssignment.data = await this.getMetadata(groupAssignment);
    }

    return groupAssignments;
  }

  async activate(id: string) {
    const groupAssignment = await this.getById(id);
    if (!groupAssignment.active && !groupAssignment.deleted) {
      groupAssignment.active = true;
      await this.groupAssignmentRepository.update(groupAssignment);
    }

    return groupAssignment;
  }

  async deactivate(id: string) {
    const groupAssignment = await this.getById(id);
    if (groupAssignment.active && !groupAssignment.deleted) {
      groupAssignment.active = false;
      await this.groupAssignmentRepository.update(groupAssignment);
    }

    return groupAssignment;
  }

  private async getMetadata(groupAssignment: LeanedDocument<GroupAssignment>) {
    const [group, user] = await Promise.all([
      this.groupRepository.getById(groupAssignment.groupId),
      this.userRepository.getById(groupAssignment.userId),
    ]);

    return { group, user };
  }

  private async validateData(data: Partial<GroupAssignment>) {
    const { groupId, userId } = data;

    if (groupId) {
      const group = await this.groupRepository.getById(groupId);
      if (!group) {
        throw new ErrorResult({
          code: 404_011,
          clean_message: 'Le groupe est introuvable',
          message: `Le groupe [${groupId}] est introuvable`,
        });
      }
      Object.assign(data, { groupSlug: group.slug });
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
