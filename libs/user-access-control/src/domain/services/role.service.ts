import { ErrorResult, StringUtils } from '@app/common/utils';
import { LeanedDocument } from '@app/core/providers/base.mongo.repository';
import { Injectable } from '@nestjs/common';
import { Role } from '../../infrastructure/models/role';
import { RoleRepository } from '../../infrastructure/repositories/role.repository';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async create(input: Partial<Role>) {
    await this.validateData(input);

    return this.roleRepository.create(input);
  }

  async update(id: string, data: Partial<Role>) {
    const role = await this.getById(id);
    Object.assign(role, { ...data });

    return this.roleRepository.update(role);
  }

  async delete(id: string) {
    const role = await this.getById(id);

    role.active = false;
    role.deleted = true;
    role.deletedAt = new Date();

    return this.roleRepository.update(role);
  }

  async getById(id: string, active = false) {
    let role: LeanedDocument<Role> | null = null;

    if (active) {
      role = await this.roleRepository.getNotDeletedById(id);
    } else {
      role = await this.roleRepository.getById(id);
    }

    if (!role) {
      throw new ErrorResult({
        code: 404_012,
        clean_message: 'Le rôle est introuvable',
        message: `Le rôle [${id}] est introuvable`,
      });
    }

    return role;
  }

  async activate(id: string) {
    const role = await this.getById(id);
    if (!role.active && !role.deleted) {
      role.active = true;
      await this.roleRepository.update(role);
    }

    return role;
  }

  async deactivate(id: string) {
    const role = await this.getById(id);
    if (role.active && !role.deleted) {
      role.active = false;
      await this.roleRepository.update(role);
    }

    return role;
  }

  private async validateData(data: Partial<Role>) {
    const { label } = data;

    if (label) {
      const slug = StringUtils.slugify(label);

      const role = await this.roleRepository.getOne({ slug });

      if (role) {
        throw new ErrorResult({
          code: 409_009,
          clean_message: 'Un rôle ayant le même libellé existe déjà',
          message: 'Un rôle ayant le même [label] existe déjà',
        });
      }

      Object.assign(data, { slug });
    }
  }
}
