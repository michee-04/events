/* eslint-disable @typescript-eslint/no-unused-vars */
import { DEFAULT_GROUP_SLUG, DEFAULT_ROLE_SLUG } from '@app/common/constants';
import { ErrorResult, validatePassword } from '@app/common/utils';
import { AppConfig } from '@app/core/config';
import {
  FilterQuery,
  LeanedDocument,
  SortQuery,
} from '@app/core/providers/base.mongo.repository';
import { PasswordService } from '@app/core/services/password.service';
import { NotifyService } from '@app/notification/infrastructure/services/notify.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Group } from '../../infrastructure/models/group';
import { Role } from '../../infrastructure/models/role';
import { User } from '../../infrastructure/models/user';
import { GroupRepository } from '../../infrastructure/repositories/group.repository';
import { GroupAssignmentRepository } from '../../infrastructure/repositories/groupAssigment.repository';
import { RoleRepository } from '../../infrastructure/repositories/role.repository';
import { RoleAssignmentRepository } from '../../infrastructure/repositories/roleAssigment.repository';
import { UserRepository } from '../../infrastructure/repositories/user.repository';

type CreateUserOptions = Record<string, any> & { isAdmin?: boolean };

export type PublicUser = Omit<
  LeanedDocument<User>,
  'password' | 'passwordSalt'
>;

@Injectable()
export class UserService {
  private readonly canValidatePassword: boolean = false;
  private readonly defaultPassword: string;
  private readonly defaultSuperAdminEmail: string;

  constructor(
    private readonly config: ConfigService<AppConfig, true>,
    private readonly notifyService: NotifyService,
    private readonly userRepository: UserRepository,
    private readonly groupRepository: GroupRepository,
    private readonly roleRepository: RoleRepository,
    private readonly groupAssignmentRepository: GroupAssignmentRepository,
    private readonly roleAssignmentRepository: RoleAssignmentRepository,
  ) {
    this.canValidatePassword = this.config.get(
      'LIB_USER_PASSWORD_VALIDATION_ENABLED',
      { infer: true },
    );
    this.defaultPassword = this.config.get('LIB_USER_DEFAULT_PASSWORD', {
      infer: true,
    });
    this.defaultSuperAdminEmail = this.config.get(
      'LIB_USER_DEFAULT_SUPER_ADMIN_EMAIL',
      { infer: true },
    );
  }

  getAll(isAdmin = false) {
    return this.userRepository.getAll({
      isAdmin,
      email: { $ne: this.defaultSuperAdminEmail },
      deleted: false,
    });
  }

  async get(
    filter: FilterQuery<User> = {},
    limit = 20,
    skip = 0,
    sort: SortQuery<User> = {},
    isAdmin = false,
  ) {
    filter = {
      ...filter,
      isAdmin,
      email: { $ne: this.defaultSuperAdminEmail },
      deleted: false,
    };
    return this.userRepository.get(filter, limit, skip, sort);
  }

  /** Create a new user */
  async create(input: Partial<User>, options: CreateUserOptions = {}) {
    const { isAdmin = false } = options;

    if (this.canValidatePassword) {
      const passwordValidationResult = validatePassword(input.password!);
      if (passwordValidationResult !== true) {
        throw new ErrorResult([
          {
            code: 400_061,
            clean_message: "Le mot de passe n'est pas sécurisé",
            message: "Le champ [password] n'est pas sécurisé",
          },
          ...passwordValidationResult.map((el) => ({
            code: el.code,
            clean_message: el.message,
            message: "Le champ [password] n'est pas sécurisé",
          })),
        ]);
      }
    }

    const existingEmail = await this.userRepository.getActiveByEmail(
      input.email!,
    );
    if (existingEmail) {
      throw new ErrorResult({
        code: 409_010,
        clean_message: "L'adresse e-mail est déjà utilisée",
        message: `L'adresse e-mail [${input.email}] est déjà utilisée`,
      });
    }

    const existingPhone = await this.userRepository.getActiveByPhone(
      input.phone!,
    );

    if (existingPhone) {
      throw new ErrorResult({
        code: 409_011,
        clean_message: 'Le numéro de téléphone est déjà utilisé',
        message: `Le numéro de téléphone [${input.phone}] est déjà utilisé`,
      });
    }

    const userDto: Partial<User> = {};
    userDto.firstname = input.firstname!;
    userDto.lastname = input.lastname!;
    userDto.gender = input.gender!;
    userDto.email = input.email!;
    userDto.phone = input.phone!;
    userDto.password = input.password || this.defaultPassword;
    userDto.isAdmin = isAdmin ?? false;
    userDto.verified = input.verified ?? userDto.isAdmin;

    // Handle password hasher
    const { salt, hashedPassword } = await this.hashPassword(userDto.password);
    userDto.passwordSalt = salt;
    userDto.password = hashedPassword;

    const user = await this.userRepository.create(userDto);
    await this.setDefaultAccesses(user._id.toString(), user.isAdmin);

    return user;
  }

  async update(
    id: string,
    input: Partial<User> & { oldPassword?: string | null },
    isAdmin = false,
  ) {
    let user = await this.userRepository.getById(id);
    if (!user || (isAdmin && !user.isAdmin)) {
      throw new ErrorResult({
        code: 404_016,
        clean_message: 'Le compte est introuvable',
        message: `Le compte [${id}] est introuvable`,
      });
    }

    //* For confirmation notification
    const oldEmail = user.email;
    const oldPhone = user.phone;

    user.firstname = input.firstname || user.firstname;
    user.lastname = input.lastname || user.lastname;
    user.gender = input.gender || user.gender;

    if (input.email) {
      const existingEmail = await this.userRepository.getActiveByEmail(
        input.email,
      );
      if (
        existingEmail &&
        existingEmail._id.toString() !== user._id.toString()
      ) {
        throw new ErrorResult({
          code: 409_010,
          clean_message: "L'adresse e-mail est déjà utilisée",
          message: `L'adresse e-mail [${input.email}] est déjà utilisée`,
        });
      }
      user.email = input.email;
    }

    if (input.phone) {
      const existingPhone = await this.userRepository.getActiveByPhone(
        input.phone,
      );
      if (
        existingPhone &&
        existingPhone._id.toString() !== user._id.toString()
      ) {
        throw new ErrorResult({
          code: 409_011,
          clean_message: 'Le numéro de téléphone est déjà utilisé',
          message: `Le numéro de téléphone [${input.phone}] est déjà utilisé`,
        });
      }
      user.phone = input.phone;
    }

    if (input.password) {
      if (this.canValidatePassword) {
        const passwordValidationResult = validatePassword(input.password);
        if (passwordValidationResult !== true) {
          throw new ErrorResult([
            {
              code: 400_061,
              clean_message: "Le mot de passe n'est pas sécurisé",
              message: "Le champ [password] n'est pas sécurisé",
            },
            ...passwordValidationResult.map((el) => ({
              code: el.code,
              clean_message: el.message,
              message: "Le champ [password] n'est pas sécurisé",
            })),
          ]);
        }
      }

      if (input.oldPassword) {
        const isOldPasswordCorrect = await this.isPasswordMatch(
          user.passwordSalt,
          input.oldPassword,
          user.password,
        );
        if (!isOldPasswordCorrect) {
          throw new ErrorResult({
            code: 401_002,
            clean_message: "L'ancien mot de passe est incorrect",
            message: 'Le champ [oldPassword] est incorrect',
          });
        }
      }

      const { salt, hashedPassword } = await this.hashPassword(input.password);
      user.passwordSalt = salt;
      user.password = hashedPassword;
    }

    user = await this.userRepository.update(user);
    if (!user) {
      throw new ErrorResult({
        code: 404_016,
        clean_message: 'Le compte est introuvable',
        message: `Le compte [${id}] est introuvable`,
      });
    }

    return { ...user, oldEmail, oldPhone };
  }

  async updateProfile(
    id: string,
    input: Partial<User>,
    lang: string | null = 'fr',
    isAdmin = false,
  ) {
    const user = await this.update(id, input, isAdmin);

    // Send confirmation notification for email update
    if (input.email && input.email !== user.oldEmail) {
      const payload = { lang, isFr: lang === 'fr' };
      Promise.all([
        this.notifyService.notifyByEmail(
          'mail-email-change-confirmation',
          payload,
          user.oldEmail,
          user._id.toString(),
        ),
      ]).catch(() => {});
    }

    // Send confirmation notification for phone update
    if (input.phone && input.phone !== user.oldPhone) {
      const payload = { lang, isFr: lang === 'fr' };
      Promise.all([
        this.notifyService.notifyByEmail(
          'mail-phone-change-confirmation',
          payload,
          user.oldEmail,
          user._id.toString(),
        ),
      ]).catch(() => {});
    }

    return user;
  }

  async updatePassword(
    id: string,
    input: { password: string; oldPassword?: string | null },
    lang: string | null = 'fr',
    isAdmin = false,
  ) {
    const user = await this.update(id, input, isAdmin);

    // Send confirmation notification
    const payload = { lang, isFr: lang === 'fr' };
    Promise.all([
      this.notifyService.notifyByEmail(
        'mail-password-change-confirmation',
        payload,
        user.email,
        user._id.toString(),
      ),
    ]).catch(() => {});

    return user;
  }

  async getByPath<K extends keyof LeanedDocument<User>>(
    key: K,
    value: LeanedDocument<User>[K],
    isAdmin?: boolean,
    active?: boolean,
  ) {
    const filter: FilterQuery<User> = { [key]: value };

    if (isAdmin != undefined) {
      filter.isAdmin = isAdmin;
    }

    if (active != undefined) {
      filter.deleted = false;
    }

    const user = await this.userRepository.getOne(
      filter,
      {},
      { password: 0, passwordSalt: 0 },
    );

    if (!user) {
      throw new ErrorResult({
        code: 404_018,
        clean_message: "L'utilisateur est introuvable",
        message: `L'utilisateur de [${value}] est introuvable`,
      });
    }

    return user;
  }

  async getById(id: string, isAdmin = false, active?: boolean) {
    return this.getByPath('_id', id as any, isAdmin, active);
  }

  async delete(id: string, isAdmin = false) {
    const user = await this.getById(id, isAdmin);

    user.active = false;
    user.deleted = true;
    user.deletedAt = new Date();

    return this.userRepository.update(user);
  }

  async activate(id: string, isAdmin = false) {
    const user = await this.getById(id, isAdmin);
    if (!user.active && !user.deleted) {
      user.active = true;
      await this.userRepository.update(user);
    }

    return user;
  }

  async deactivate(id: string, isAdmin = false) {
    const user = await this.getById(id, isAdmin);
    if (user.active && !user.deleted) {
      user.active = false;
      await this.userRepository.update(user);
    }

    return user;
  }

  getPublicInfo(
    user: LeanedDocument<User> & { oldEmail?: string; oldPhone?: string },
  ): PublicUser {
    const {
      password: _,
      passwordSalt: __,
      oldEmail: ___,
      oldPhone: ____,
      ...userData
    } = user;
    return userData;
  }

  private hashPassword(password: string) {
    return PasswordService.hashPassword(password);
  }

  private isPasswordMatch(
    salt: string,
    password: string,
    hashedPassword: string,
  ) {
    return PasswordService.isPasswordMatch(salt, password, hashedPassword);
  }

  private async setDefaultAccesses(userId: string, isAdmin = false) {
    // Set default role and group slugs
    const roleSlugs: string[] = [DEFAULT_ROLE_SLUG.USER];
    const groupSlugs: string[] = [DEFAULT_GROUP_SLUG.USERS];

    if (isAdmin) {
      roleSlugs.push(DEFAULT_ROLE_SLUG.ADMIN);
      groupSlugs.push(DEFAULT_GROUP_SLUG.ADMINS);
    }

    // Get related roles and groups
    const [roles, groups] = await Promise.all([
      this.roleRepository.getAll({ slug: { $in: roleSlugs } }),
      this.groupRepository.getAll({ slug: { $in: groupSlugs } }),
    ]);

    // Assign roles and groups to the user
    await Promise.all([
      ...roles.map((r) => this.addRole(userId, r)),
      ...groups.map((g) => this.addGroup(userId, g)),
    ]);
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
