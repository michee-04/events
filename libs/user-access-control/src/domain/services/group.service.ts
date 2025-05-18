import { Injectable } from '@nestjs/common';

import { ErrorResult, StringUtils } from '@app/common/utils';
import { LeanedDocument } from '@app/core/providers/base.mongo.repository';
import { Group } from '../../infrastructure/models/group';
import { GroupRepository } from '../../infrastructure/repositories/group.repository';
import { RoleRepository } from '../../infrastructure/repositories/role.repository';

@Injectable()
export class GroupService {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async create(input: Partial<Group>) {
    await this.validateData(input);

    return this.groupRepository.create(input);
  }

  async update(id: string, data: Partial<Group>) {
    const group = await this.getById(id);
    Object.assign(group, { ...data });

    return this.groupRepository.update(group);
  }

  async delete(id: string) {
    const group = await this.getById(id);

    group.active = false;
    group.deleted = true;
    group.deletedAt = new Date();

    return this.groupRepository.update(group);
  }

  async getById(id: string, active = false) {
    let group: LeanedDocument<Group> | null = null;

    if (active) {
      group = await this.groupRepository.getNotDeletedById(id);
    } else {
      group = await this.groupRepository.getById(id);
    }

    if (!group) {
      throw new ErrorResult({
        code: 404_011,
        clean_message: 'Le groupe est introuvable',
        message: `Le groupe [${id}] est introuvable`,
      });
    }

    return group;
  }

  async activate(id: string) {
    const group = await this.getById(id);
    if (!group.active && !group.deleted) {
      group.active = true;
      await this.groupRepository.update(group);
    }

    return group;
  }

  async deactivate(id: string) {
    const group = await this.getById(id);
    if (group.active && !group.deleted) {
      group.active = false;
      await this.groupRepository.update(group);
    }

    return group;
  }

  async addRole(groupId: string, roleId: string) {
    const group = await this.getById(groupId);

    const role = await this.roleRepository.getById(roleId);
    if (!role) {
      throw new ErrorResult({
        code: 404_012,
        clean_message: 'Le rôle est introuvable',
        message: `Le rôle [${roleId}] est introuvable`,
      });
    }

    let roles = group.roles ?? [];
    roles = roles.map((objectId) => objectId.toString());
    roles = [...new Set([...roles, roleId])];

    Object.assign(group, { roles });
    await this.groupRepository.update(group);

    return group;
  }

  async removeRole(groupId: string, roleId: string) {
    const group = await this.getById(groupId);

    if (Array.isArray(group.roles) && group.roles.length > 0) {
      const roles = group.roles.filter((id) => id.toString() !== roleId);
      Object.assign(group, { roles });
      await this.groupRepository.update(group, { flatten: false });
    }

    return group;
  }

  private async validateData(data: Partial<Group>) {
    const { label } = data;

    if (label) {
      const slug = StringUtils.slugify(label);

      const group = await this.groupRepository.getOne({ slug });

      if (group) {
        throw new ErrorResult({
          code: 409_008,
          clean_message: 'Un groupe ayant le même libellé existe déjà',
          message: 'Un groupe ayant le même [label] existe déjà',
        });
      }

      Object.assign(data, { slug });
    }
  }
}
