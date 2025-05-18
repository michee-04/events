import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DEFAULT_GROUP_SLUG, DEFAULT_ROLE_SLUG } from '@app/common/constants';
import { AppConfig } from '@app/core/config';
import { LeanedDocument } from '@app/core/providers/base.mongo.repository';
import { PasswordService } from '@app/core/services/password.service';
import { Group } from '../models/group';
import { Role } from '../models/role';
import { GroupRepository } from '../repositories/group.repository';
import { GroupAssignmentRepository } from '../repositories/groupAssigment.repository';
import { RoleRepository } from '../repositories/role.repository';
import { RoleAssignmentRepository } from '../repositories/roleAssigment.repository';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class AccessControlDefaultsService implements OnModuleInit {
  private readonly defaultSuperAdminEmail: string;
  private readonly defaultSuperAdminPassword: string;

  constructor(
    private readonly config: ConfigService<AppConfig, true>,
    private readonly userRepository: UserRepository,
    private readonly groupRepository: GroupRepository,
    private readonly roleRepository: RoleRepository,
    private readonly groupAssignmentRepository: GroupAssignmentRepository,
    private readonly roleAssignmentRepository: RoleAssignmentRepository,
  ) {
    this.defaultSuperAdminEmail = this.config.get(
      'LIB_USER_DEFAULT_SUPER_ADMIN_EMAIL',
      { infer: true },
    );

    this.defaultSuperAdminPassword = this.config.get(
      'LIB_USER_DEFAULT_SUPER_ADMIN_PASSWORD',
      { infer: true },
    );
  }

  async onModuleInit() {
    try {
      //* Roles and Groups must be created first
      const [roles, groups] = await Promise.all([
        this.createDefaultRoles(),
        this.createDefaultGroups(),
      ]);

      //* Create default super admin and, add default roles and groups
      const superAmin = await this.createDefaultSuperAdmin();
      if (superAmin) {
        await Promise.all([
          ...roles.map((r) => this.addRole(superAmin._id.toString(), r)),
          ...groups.map((g) => this.addGroup(superAmin._id.toString(), g)),
        ]);
      }
    } catch (error) {
      throw error;
    }
  }

  private async createDefaultRoles() {
    let defaultRoles = await this.roleRepository.getAll({
      slug: { $in: Object.values(DEFAULT_ROLE_SLUG) },
    });

    if (defaultRoles.length === 0) {
      defaultRoles = await Promise.all([
        this.roleRepository.create({
          label: 'User',
          slug: DEFAULT_ROLE_SLUG.USER,
          description: "Rôle d'un utilisateur",
          active: true,
        }),
        this.roleRepository.create({
          label: 'Admin',
          slug: DEFAULT_ROLE_SLUG.ADMIN,
          description: "Rôle d'un administrateur",
          active: true,
        }),
        this.roleRepository.create({
          label: 'Superadmin',
          slug: DEFAULT_ROLE_SLUG.SUPERADMIN,
          description: "Rôle d'un super administrateur",
          active: true,
        }),
      ]);
    }

    return defaultRoles;
  }

  private async createDefaultGroups() {
    let defaultGroups = await this.groupRepository.getAll({
      slug: { $in: Object.values(DEFAULT_GROUP_SLUG) },
    });

    if (defaultGroups.length === 0) {
      defaultGroups = await Promise.all([
        this.groupRepository.create({
          label: 'Users',
          slug: DEFAULT_GROUP_SLUG.USERS,
          description: 'Groupe des utilisateurs',
          active: true,
        }),
        this.groupRepository.create({
          label: 'Admins',
          slug: DEFAULT_GROUP_SLUG.ADMINS,
          description: 'Groupe des administrateurs',
          active: true,
        }),
        this.groupRepository.create({
          label: 'Superadmins',
          slug: DEFAULT_GROUP_SLUG.SUPERADMINS,
          description: 'Groupe des super administrateurs',
          active: true,
        }),
      ]);
    }

    return defaultGroups;
  }

  private async createDefaultSuperAdmin() {
    let superAdmin = await this.userRepository.getByEmail(
      this.defaultSuperAdminEmail,
    );

    if (superAdmin) return null;

    const { salt, hashedPassword } = await PasswordService.hashPassword(
      this.defaultSuperAdminPassword,
    );

    superAdmin = await this.userRepository.create({
      firstname: 'Super',
      lastname: 'Admin',
      gender: 'A',
      email: this.defaultSuperAdminEmail,
      phone: '+228xxxxxxxx',
      passwordSalt: salt,
      password: hashedPassword,
      isAdmin: true,
      verified: true,
    });

    return superAdmin;
  }

  private addRole(userId: string, role: LeanedDocument<Role>) {
    return this.roleAssignmentRepository.create({
      userId,
      roleId: role._id,
      roleSlug: role.slug,
      active: true,
    });
  }

  private addGroup(userId: string, group: LeanedDocument<Group>) {
    return this.groupAssignmentRepository.create({
      userId,
      groupId: group._id,
      groupSlug: group.slug,
      active: true,
    });
  }
}
