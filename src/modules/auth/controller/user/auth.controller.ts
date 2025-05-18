/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorResult, HttpUtils } from '@app/common/utils';
import { AppConfig } from '@app/core/config';
import { LeanedDocument } from '@app/core/providers/base.mongo.repository';
import { JournalService } from '@app/journal/domain/services/journal.service';
import { NotifyService } from '@app/notification/infrastructure/services/notify.service';
import {
  AuthService,
  AuthTokenData,
} from '@app/user-access-control/domain/services/auth.service';
import { UserService } from '@app/user-access-control/domain/services/user.service';
import { LoginOtp } from '@app/user-access-control/infrastructure/models/loginOtp';
import { RecoverPasswordOtp } from '@app/user-access-control/infrastructure/models/recoverPasswordOtp';
import { LoginOtpRepository } from '@app/user-access-control/infrastructure/repositories/loginOtp.repository';
import { RecoverPasswordOtpRepository } from '@app/user-access-control/infrastructure/repositories/recoverPasswordOtp.repository';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  LogLevel,
  Post,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { API_APP_PREFIX_V1 } from 'src/modules/core/constants';
import { Public } from 'src/modules/core/decorators';
import { HeaderName } from 'src/modules/core/http';
import {
  CreateUserDto,
  LoginData,
  LoginSendOtpDto,
  LoginUserDto,
  LoginValidateOtpDto,
  LoginWithOtpData,
  RecoverPasswordRequestDto,
  RecoverPasswordValidationDto,
  RecoverPasswordWithOtpData,
  RefreshTokenDto,
  ResendVerificationEmailDto,
  VerifyEmailDto,
} from '../../dto';

@Public()
@Controller('user/auth')
export class AuthController {
  private readonly appName: string;
  private readonly otpLifeInMin: number;

  constructor(
    private readonly config: ConfigService<AppConfig, true>,
    private readonly loginOtpRepository: LoginOtpRepository,
    private readonly recoverPasswordOtpRepository: RecoverPasswordOtpRepository,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly notifyService: NotifyService,
    private readonly journalService: JournalService,
  ) {
    this.appName = this.config.get('APP_NAME', { infer: true });
    this.otpLifeInMin = this.config.get('LIB_USER_OTP_EXPIRES_IN_MIN', {
      infer: true,
    });
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Req() req: Request) {
    try {
      const input = new CreateUserDto(req.body);

      const result = await this.userService.create(
        { ...input },
        { isAdmin: false },
      );

      return this.userService.getPublicInfo(result);
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('login/otp')
  async loginWithOtp(@Req() req: Request) {
    try {
      const input = new LoginUserDto(req.body);

      const otpData = await this.authService.loginWithOtp(input);
      return new LoginWithOtpData(otpData);
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('login/sendotp')
  async loginSendOtp(@Req() req: Request) {
    try {
      const { body, headers } = req;
      const lang = headers[HeaderName.LANG] as string | undefined;
      const { token } = new LoginSendOtpDto(body);

      const otpData = await this.loginOtpRepository.getOneActiveByToken(token);
      if (!otpData) {
        throw new ErrorResult({
          code: 400_036,
          clean_message: 'Le token est expiré ou invalide',
          message: 'Le token est expiré ou invalide',
        });
      }

      this.sendLoginOtpNotification(otpData, lang);

      return null;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('login/validateOtp')
  async loginValidateOtp(@Req() req: Request) {
    try {
      const input = new LoginValidateOtpDto(req.body);

      const tokenData = (await this.authService.validateLoginOtp(
        input,
        {
          ipAddress: HttpUtils.getIp(req),
        },
        { isApi: true },
      )) as AuthTokenData;

      return new LoginData(tokenData);
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh_token')
  async refreshToken(@Req() req: Request) {
    try {
      const { token } = new RefreshTokenDto(req.body);

      const tokenData = await this.authService.refreshToken(token, {
        ipAddress: HttpUtils.getIp(req),
      });

      return new LoginData(tokenData);
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('resend-verify-email')
  async resendVerificationEmail(@Req() req: Request) {
    try {
      const { body, headers } = req;
      const lang = headers[HeaderName.LANG] as string | undefined;
      const { email } = new ResendVerificationEmailDto(body);

      const user = await this.userService.getByPath('email', email);
      await this.authService.sendVerificationEmail(
        user,
        `/${API_APP_PREFIX_V1}/user/auth/verify-email`,
        lang,
      );

      return null;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('password/recover/request_otp')
  async recoverPasswordWithOtp(@Req() req: Request) {
    try {
      const { email } = new RecoverPasswordRequestDto(req.body);
      const otpData = await this.authService.requestPasswordResetOtp(email);
      return new RecoverPasswordWithOtpData(otpData);
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('password/recover/send_otp')
  async recoverPasswordSendOtp(@Req() req: Request) {
    try {
      const { body, headers } = req;
      const lang = headers[HeaderName.LANG] as string | undefined;
      const { token } = new RecoverPasswordOtp(body);

      const otpData =
        await this.recoverPasswordOtpRepository.getOneActiveByToken(token);
      if (!otpData) {
        throw new ErrorResult({
          code: 400_036,
          clean_message: 'Le token est expiré ou invalide',
          message: 'Le token est expiré ou invalide',
        });
      }

      this.sendRecoverPasswordOtpNotification(otpData, lang);

      return null;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('password/recover/validate_otp')
  async recoverPasswordValidateOtp(@Req() req: Request) {
    try {
      const { body, headers } = req;
      const lang = headers[HeaderName.LANG] as string | undefined;
      const { otp, token, password } = new RecoverPasswordValidationDto(body);

      const user = await this.authService.validatePasswordResetOtp({
        otp,
        token,
      });
      await this.userService.updatePassword(
        user._id.toString(),
        { password },
        lang,
      );

      return null;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get('verify-email')
  async verifyEmail(@Req() req: Request) {
    try {
      const { token } = new VerifyEmailDto(req.query as any);
      await this.authService.verifyEmail(token);
      return null;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  private sendLoginOtpNotification(
    otpData: LeanedDocument<LoginOtp>,
    lang = 'fr',
  ) {
    const payload = {
      lang,
      isFr: lang === 'fr',
      appName: this.appName,
      otpCode: otpData.otp,
      expiresIn: this.otpLifeInMin,
    };

    Promise.all([
      this.notifyService.notifyByEmail(
        'mail-authentication-otp',
        payload,
        otpData.email,
      ),
    ]).catch(() => {});
  }

  private sendRecoverPasswordOtpNotification(
    otpData: LeanedDocument<RecoverPasswordOtp>,
    lang = 'fr',
  ) {
    const payload = {
      lang,
      isFr: lang === 'fr',
      appName: this.appName,
      otpCode: otpData.otp,
      expiresIn: this.otpLifeInMin,
    };

    Promise.all([
      this.notifyService.notifyByEmail(
        'mail-password-reset-otp',
        payload,
        otpData.email,
      ),
    ]).catch(() => {});
  }

  private log(level: LogLevel, message?: string, data?: Record<string, any>) {
    this.journalService.save(
      'ApiAuthModule',
      this.constructor.name,
      level,
      message || 'Controller error',
      data,
    );
  }
}
