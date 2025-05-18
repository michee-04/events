/* eslint-disable @typescript-eslint/no-unused-vars */
import { DateUtils, ErrorResult, StringUtils } from '@app/common/utils';
import { AppConfig } from '@app/core/config';
import { LeanedDocument } from '@app/core/providers/base.mongo.repository';
import { CipherService } from '@app/core/services/cipher.service';
import { JwtSignatureService } from '@app/core/services/jwtSignature.service';
import { PasswordService } from '@app/core/services/password.service';
import { LogLevel } from '@app/core/types';
import { JournalService } from '@app/journal/domain/services/journal.service';
import { NotifyService } from '@app/notification/infrastructure/services/notify.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ms from 'ms';
import { User } from '../../infrastructure/models/user';
import { LoginOtpRepository } from '../../infrastructure/repositories/loginOtp.repository';
import { RecoverPasswordOtpRepository } from '../../infrastructure/repositories/recoverPasswordOtp.repository';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { TokenService } from '../../infrastructure/services/token.service';
import { PublicUser } from './user.service';

type Credentials = { username: string; password: string };
type Metadata = { ipAddress: string; appType?: string };

export type AuthTokenPayload = {
  organization_access: {
    names: string[];
  };
  metadata: {
    type: 'access_token' | 'refresh_token';
  };
  account: {
    id: string;
  };
};

export type AuthEmailVerificationPayload = {
  userId: string;
  email: string;
  exp: number;
};

export type AuthOptions = {
  isApi?: boolean;
  isAdmin?: boolean;
};

export type AuthOtpValidationPayload = {
  otp: string;
  token: string;
};

export type AuthTokenData = {
  access_token: string;
  access_expires_at: number;
  refresh_token: string;
  refresh_expires_at: number;
  token_type: string;
  scope: string;
};

@Injectable()
export class AuthService {
  private readonly appName: string;
  private readonly apiBaseUrl: string;
  private readonly otpLifeInMin: number;

  private readonly whitelistEmails: string[];
  private readonly whitelistOtp: string;

  private readonly jwtSecret: string;
  private readonly jwtIssuer: string;
  private readonly jwtAccessExpiresIn: ms.StringValue;
  private readonly jwtRefreshExpiresIn: ms.StringValue;

  private readonly verifyEmailTokenLifeInMin: number;
  private readonly verifyEmailCipherKey: string;
  private readonly verifyEmailCipherIV: string;

  constructor(
    private readonly config: ConfigService<AppConfig, true>,
    private readonly notifyService: NotifyService,
    private readonly journalService: JournalService,

    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
    private readonly loginOtpRepository: LoginOtpRepository,
    private readonly recoverPasswordOtpRepository: RecoverPasswordOtpRepository,
  ) {
    this.appName = this.config.get('APP_NAME', { infer: true });
    this.apiBaseUrl = this.config.get('API_APP_BASE_URL', { infer: true });
    this.otpLifeInMin = this.config.get('LIB_USER_OTP_EXPIRES_IN_MIN', {
      infer: true,
    });

    this.whitelistEmails = this.config
      .get('LIB_USER_WHITELIST_EMAILS', { infer: true })
      .split(',')
      .map((s) => s.trim());
    this.whitelistOtp = this.config.get('LIB_USER_WHITELIST_OTP', {
      infer: true,
    });

    this.jwtSecret = this.config.get('LIB_USER_JWT_SECRET', {
      infer: true,
    });
    this.jwtIssuer = this.config.get('LIB_USER_JWT_ISSUER', {
      infer: true,
    });
    this.jwtAccessExpiresIn = this.config.get('LIB_USER_JWT_TOKEN_EXPIRES_IN', {
      infer: true,
    });
    this.jwtRefreshExpiresIn = this.config.get(
      'LIB_USER_JWT_REFRESH_TOKEN_EXPIRES_IN',
      { infer: true },
    );

    this.verifyEmailTokenLifeInMin = this.config.get(
      'LIB_USER_EMAIL_VERIFICATION_TOKEN_EXPIRES_IN_MIN',
      { infer: true },
    );
    this.verifyEmailCipherKey = this.config.get(
      'LIB_USER_EMAIL_VERIFICATION_CIPHER_KEY',
      { infer: true },
    );
    this.verifyEmailCipherIV = this.config.get(
      'LIB_USER_EMAIL_VERIFICATION_CIPHER_IV',
      { infer: true },
    );
  }

  async login(creds: Credentials, meta: Metadata, options: AuthOptions) {
    const { isApi = false, isAdmin = false } = options;
    const user = await this.handleLogin(creds, isAdmin);

    if (isApi) {
      return this.generateJwtTokens(user, meta);
    }

    return this.formatUser(user);
  }

  async loginWithOtp(creds: Credentials, isAdmin = false) {
    const user = await this.handleLogin(creds, isAdmin);

    const old = await this.loginOtpRepository.getLastOneByEmail(user.email);

    if (old && !DateUtils.isAfter(new Date(), old.exp) && !old.checked) {
      return old;
    }

    return this.generateLoginOtp(user);
  }

  async validateLoginOtp(
    { otp, token }: AuthOtpValidationPayload,
    meta: Metadata,
    options: AuthOptions,
  ) {
    const { isApi = false, isAdmin = false } = options;
    const data = await this.loginOtpRepository.getOneByOtpAndToken(otp, token);

    if (!data) {
      throw new ErrorResult({
        code: 400_058,
        clean_message: 'Le code de vérification est invalide',
        message: "Le token ou l'otp est invalide",
      });
    }

    if (DateUtils.isAfter(new Date(), data.exp)) {
      this.log(
        'info',
        `L'utilisateur ${data.email} a fourni un token/otp de connexion est expiré`,
      );
      throw new ErrorResult({
        code: 400_059,
        clean_message: 'Le code de vérification est expiré',
        message: "L'otp est expiré",
      });
    }

    data.checked = true;
    this.loginOtpRepository.update(data).catch(() => {});

    const user = await this.userRepository.getOne({
      email: data.email,
      isAdmin,
    });
    if (!user) {
      throw new ErrorResult({
        code: 404_016,
        clean_message: 'Le compte est introuvable',
        message: `Le compte [${data.email}] est introuvable`,
      });
    }

    if (isApi) {
      return this.generateJwtTokens(user, meta);
    }

    this.log(
      'info',
      `L'utilisateur ${data.email} a réussi à valider son token/otp de connexion`,
    );
    return this.formatUser(user);
  }

  async generateLoginOtp(user: LeanedDocument<User>) {
    const otp = this.whitelistEmails.includes(user.email)
      ? this.whitelistOtp
      : StringUtils.generateRandomNumber(6);

    this.log(
      'info',
      `L'utilisateur ${user.email} a réussi à obtenir un token/otp de connexion`,
    );
    return this.loginOtpRepository.create({
      otp,
      email: user.email,
      phone: user.phone,
      token: StringUtils.generateRandomString(100),
      exp: DateUtils.addMinutes(new Date(), this.otpLifeInMin),
      checked: false,
    });
  }

  /** Reauthenticate a user by a given refresh token */
  async refreshToken(token: string, meta: Metadata, isAdmin = false) {
    let decoded: AuthTokenPayload;

    try {
      decoded = (await this.verifyJwtPayload(token)) as AuthTokenPayload;
      await this.tokenService.verifyRefreshToken(decoded.account.id, token);
    } catch {
      throw new ErrorResult({
        code: 400_036,
        clean_message: 'Le token est expiré ou invalide',
        message: 'Le refresh token est expiré ou invalide',
      });
    }

    if (decoded.metadata?.type !== 'refresh_token') {
      throw new ErrorResult({
        code: 400_060,
        clean_message: 'Le token est invalide',
        message: 'Le refresh token est invalide',
      });
    }

    const user = await this.userRepository.getOne({
      _id: decoded.account.id,
      isAdmin,
    });
    if (!user) {
      throw new ErrorResult({
        code: 404_016,
        clean_message: 'Le compte est introuvable',
        message: `Le compte [${decoded.account.id}] est introuvable`,
      });
    }

    this.log(
      'info',
      `L'utilisateur ${user.email} a réussi à rafraîchir ses tokens d'authentification`,
    );
    return this.generateJwtTokens(user, meta);
  }

  async requestPasswordResetOtp(email: string, isAdmin = false) {
    this.log(
      'info',
      `L'utilisateur ${email} a initié une demande de réinitialisation de mot de passe`,
    );

    const user = await this.userRepository.getOne({ email, isAdmin });
    await this.validateUser(user, email);

    const old =
      await this.recoverPasswordOtpRepository.getLastOneByEmail(email);
    if (old && !DateUtils.isAfter(new Date(), old.exp) && !old.checked) {
      return old;
    }

    this.log(
      'info',
      `L'utilisateur ${email} a réussi à obtenir un token/otp de rénitialisation de mot de passe`,
    );
    return this.recoverPasswordOtpRepository.create({
      otp: StringUtils.generateRandomNumber(6),
      email,
      phone: user!.phone,
      token: StringUtils.generateRandomString(100),
      exp: DateUtils.addMinutes(new Date(), this.otpLifeInMin),
      checked: false,
    });
  }

  async validatePasswordResetOtp(
    { otp, token }: AuthOtpValidationPayload,
    isAdmin = false,
  ) {
    const data = await this.recoverPasswordOtpRepository.getOneByOtpAndToken(
      otp,
      token,
    );

    if (!data) {
      throw new ErrorResult({
        code: 400_058,
        clean_message: 'Le code de vérification est invalide',
        message: "Le token ou l'otp est invalide",
      });
    }

    if (DateUtils.isAfter(new Date(), data.exp)) {
      throw new ErrorResult({
        code: 400_059,
        clean_message: 'Le code de vérification est expiré',
        message: "L'otp est expiré",
      });
    }

    data.checked = true;
    this.recoverPasswordOtpRepository.update(data);

    const user = await this.userRepository.getOne({
      email: data.email,
      isAdmin,
    });
    if (!user) {
      throw new ErrorResult({
        code: 404_016,
        clean_message: 'Le compte est introuvable',
        message: `Le compte [${data.email}] est introuvable`,
      });
    }

    this.log(
      'info',
      `L'utilisateur ${user.email} a réussi à valider son token/otp de rénitialisation de mot de passe`,
    );
    return this.formatUser(user);
  }

  async sendVerificationEmail(
    user: LeanedDocument<User>,
    callbackRoutePath: string,
    lang = 'fr',
  ) {
    try {
      if (user.verified) return;

      const data: AuthEmailVerificationPayload = {
        userId: user._id.toString(),
        email: user.email,
        exp: DateUtils.addMinutes(
          new Date(),
          this.verifyEmailTokenLifeInMin,
        ).getTime(),
      };
      const token = CipherService.encrypt(
        data,
        this.verifyEmailCipherKey,
        this.verifyEmailCipherIV,
      );

      const verificationUrl = `${this.apiBaseUrl}${callbackRoutePath}?token=${token}`;
      const payload = {
        lang,
        isFr: lang === 'fr',
        appName: this.appName,
        verificationUrl,
        expiresIn: this.verifyEmailTokenLifeInMin,
      };

      this.notifyService
        .notifyByEmail(
          'mail-email-verification',
          payload,
          user.email,
          user._id.toString(),
        )
        .catch(() => {});
    } catch (error) {
      this.log('error', '', error);
    }
  }

  async verifyEmail(token: string) {
    try {
      const decoded = CipherService.decrypt(
        token,
        this.verifyEmailCipherKey,
        this.verifyEmailCipherIV,
        true,
      ) as AuthEmailVerificationPayload;

      const user = await this.userRepository.getById(decoded.userId);
      if (!user) {
        throw new ErrorResult({
          code: 404_016,
          clean_message: 'Le compte est introuvable',
          message: `Le compte [${decoded.userId}] est introuvable`,
        });
      }

      if (user.verified) return;

      user.verified = true;
      await this.userRepository.update({ ...user });

      this.log(
        'info',
        `L'utilisateur ${user.email} a réussi à vérifier son compte`,
      );
    } catch (error) {
      this.log('error', '', error);
      throw new ErrorResult({
        code: 400_069,
        clean_message: 'La vérification a échoué',
        message: 'Le token est invalide',
      });
    }
  }

  isPasswordMatch(salt: string, password: string, hashedPassword: string) {
    return PasswordService.isPasswordMatch(salt, password, hashedPassword);
  }

  signJwtAccessTokenPayload(payload: Record<string, any>) {
    return JwtSignatureService.signPayload(payload, this.jwtSecret, {
      expiresIn: this.jwtAccessExpiresIn,
      issuer: this.jwtIssuer,
    });
  }

  signJwtRefreshTokenPayload(payload: Record<string, any>) {
    return JwtSignatureService.signPayload(payload, this.jwtSecret, {
      expiresIn: this.jwtRefreshExpiresIn,
      issuer: this.jwtIssuer,
    });
  }

  verifyJwtPayload(token: string) {
    return JwtSignatureService.verifyPayload(token, this.jwtSecret);
  }

  private async handleLogin(creds: Credentials, isAdmin = false) {
    try {
      const { username, password } = creds;

      const user = await this.userRepository.getOne({
        email: username,
        isAdmin,
      });
      await this.validateUser(user, username);

      const isCorrectPassword = await this.isPasswordMatch(
        user!.passwordSalt,
        password,
        user!.password,
      );
      if (!isCorrectPassword) {
        this.log(
          'info',
          `L'utilisateur ${username} a fourni un mot de passe incorrect`,
        );
        throw new ErrorResult({
          code: 401_003,
          clean_message: 'Le mot de passe est incorrect',
          message: 'Le mot de passe est incorrect',
        });
      }

      this.log('info', `L'utilisateur ${username} a réussi à se connecter`);
      return user!;
    } catch {
      throw new ErrorResult({
        code: 401_007,
        clean_message: "L'adresse email ou le mot de passe sont incorrects.",
        message: "L'adresse email ou le mot de passe sont incorrects.",
      });
    }
  }

  private async validateUser(
    user: LeanedDocument<User> | null,
    identifier: string,
  ) {
    if (!user) {
      this.log('info', `Le compte utilisateur ${identifier} est introuvable`);
      throw new ErrorResult({
        code: 404_016,
        clean_message: 'Le compte est introuvable',
        message: `Le compte [${identifier}] est introuvable`,
      });
    }

    if (!user.verified) {
      this.log('info', `Le compte utilisateur ${identifier} n'est pas vérifié`);
      throw new ErrorResult({
        code: 403_002,
        clean_message: "Le compte n'est pas vérifié",
        message: `Le compte [${identifier}] n'est pas vérifié`,
      });
    }

    if (!user.active) {
      this.log('info', `Le compte utilisateur ${identifier} est désactivé`);
      throw new ErrorResult({
        code: 403_003,
        clean_message: 'Le compte est désactivé',
        message: `Le compte [${identifier}] est désactivé`,
      });
    }
  }

  /** Generate access and refresh tokens for a given user */
  private async generateJwtTokens(user: LeanedDocument<User>, meta: Metadata) {
    const accessTokenPayload = this.constructAccessTokenPayload(user);
    const accessTokenData =
      await this.signJwtAccessTokenPayload(accessTokenPayload);

    const refreshTokenPayload = this.constructRefreshTokenData(user);
    const refreshTokenData =
      await this.signJwtRefreshTokenPayload(refreshTokenPayload);

    const data: AuthTokenData = {
      access_token: accessTokenData.token,
      access_expires_at: accessTokenData.expiresAt,
      refresh_token: refreshTokenData.token,
      refresh_expires_at: refreshTokenData.expiresAt,
      token_type: 'Bearer',
      scope: 'authentication',
    };

    await this.tokenService.save({
      userId: user._id.toString(),
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      ipAddress: meta.ipAddress,
      appType: meta.appType,
    });

    return data;
  }

  private constructAccessTokenPayload(
    user: LeanedDocument<User>,
  ): AuthTokenPayload {
    return {
      organization_access: {
        names: ['digital.gouv.tg'],
      },
      metadata: {
        type: 'access_token',
      },
      account: {
        id: user._id.toString(),
      },
    };
  }

  private constructRefreshTokenData(
    user: LeanedDocument<User>,
  ): AuthTokenPayload {
    return {
      organization_access: {
        names: ['digital.gouv.tg'],
      },
      metadata: {
        type: 'refresh_token',
      },
      account: {
        id: user._id.toString(),
      },
    };
  }

  private formatUser(user: LeanedDocument<User>): PublicUser {
    const { password: _, passwordSalt: __, ...userData } = user;
    return userData;
  }

  private log(level: LogLevel, message?: string, data?: Record<string, any>) {
    this.journalService.save(
      'UserAccessControlDomainModule',
      this.constructor.name,
      level as any,
      message || 'Service error',
      data,
    );
  }
}
