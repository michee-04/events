import { ErrorResult, HttpUtils } from '@app/common/utils';
import { AppConfig } from '@app/core/config';
import { LeanedDocument } from '@app/core/providers/base.mongo.repository';
import { JournalService } from '@app/journal/domain/services/journal.service';
import { NotifyService } from '@app/notification/infrastructure/services/notify.service';
import { AuthService } from '@app/user-access-control/domain/services/auth.service';
import { UserService } from '@app/user-access-control/domain/services/user.service';
import { LoginOtp } from '@app/user-access-control/infrastructure/models/loginOtp';
import { RecoverPasswordOtp } from '@app/user-access-control/infrastructure/models/recoverPasswordOtp';
import { LoginOtpRepository } from '@app/user-access-control/infrastructure/repositories/loginOtp.repository';
import { RecoverPasswordOtpRepository } from '@app/user-access-control/infrastructure/repositories/recoverPasswordOtp.repository';
import {
  Controller,
  HttpCode,
  HttpStatus,
  LogLevel,
  Post,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from 'src/modules/core/decorators';
import {
  ApiEmptyDataResponse,
  ApiErrorResponse,
  HeaderName,
} from 'src/modules/core/http';
import {
  LoginData,
  LoginResponse,
  LoginSendOtpDto,
  LoginUserDto,
  LoginValidateOtpDto,
  LoginWithOtpData,
  LoginWithOtpResponse,
  RecoverPasswordRequestDto,
  RecoverPasswordSendOtpDto,
  RecoverPasswordValidationDto,
  RecoverPasswordWithOtpData,
  RecoverPasswordWithOtpResponse,
  RefreshTokenDto,
} from '../../dto';

@Public()
@ApiTags('Auth - Admin')
@Controller('admin/auth')
export class AdminAuthController {
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

  @ApiOperation({ summary: 'Se connecter' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Req() req: Request) {
    try {
      const input = new LoginUserDto(req.body);

      const tokenData = await this.authService.login(
        input,
        {
          ipAddress: HttpUtils.getIp(req),
        },
        { isApi: true, isAdmin: true },
      );

      return new LoginData(tokenData as any);
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Se connecter avec OTP (ETAPE 1)' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: HttpStatus.OK, type: LoginWithOtpResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Post('login/otp')
  async loginWithOtp(@Req() req: Request) {
    try {
      const input = new LoginUserDto(req.body);
      const otpData = await this.authService.loginWithOtp(input, true);
      return new LoginWithOtpData(otpData);
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({
    summary:
      'Soumettre le token de validation de connexion pour obtenir un code de vérification OTP (ETAPE 2)',
  })
  @ApiBody({ type: LoginSendOtpDto })
  @ApiResponse({ status: HttpStatus.OK, type: ApiEmptyDataResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
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

  @ApiOperation({ summary: 'Valider la connexion OTP (ETAPE 3)' })
  @ApiBody({ type: LoginValidateOtpDto })
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Post('login/validateOtp')
  async loginValidateOtp(@Req() req: Request) {
    try {
      const input = new LoginValidateOtpDto(req.body);

      const tokenData = await this.authService.validateLoginOtp(
        input,
        {
          ipAddress: HttpUtils.getIp(req),
        },
        { isApi: true, isAdmin: true },
      );

      return new LoginData(tokenData as any);
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({
    summary:
      "Rafraîchir les tokens JWT à l'aide d'un token de rafraîchissement",
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Post('refresh_token')
  async refreshToken(@Req() req: Request) {
    try {
      const { token } = new RefreshTokenDto(req.body);

      const tokenData = await this.authService.refreshToken(
        token,
        {
          ipAddress: HttpUtils.getIp(req),
        },
        true,
      );

      return new LoginData(tokenData);
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Faire une demande de réinitialisation de mot de passe (ETAPE 1)',
  })
  @ApiBody({ type: RecoverPasswordRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    type: RecoverPasswordWithOtpResponse,
  })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Post('password/recover/request_otp')
  async recoverPasswordWithOtp(@Req() req: Request) {
    try {
      const { email } = new RecoverPasswordRequestDto(req.body);
      const otpData = await this.authService.requestPasswordResetOtp(
        email,
        true,
      );
      return new RecoverPasswordWithOtpData(otpData);
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({
    summary:
      'Soumettre le token de réinitialisation de mot de passe pour obtenir un code de vérification (ETAPE 2)',
  })
  @ApiBody({ type: RecoverPasswordSendOtpDto })
  @ApiResponse({ status: HttpStatus.OK, type: ApiEmptyDataResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Post('password/recover/send_otp')
  async recoverPasswordSendOtp(@Req() req: Request) {
    try {
      const { body, headers } = req;
      const lang = headers[HeaderName.LANG] as string | undefined;
      const { token } = new RecoverPasswordSendOtpDto(body);

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

  @ApiOperation({ summary: 'Réinitialiser le mot de passe (ETAPE 3)' })
  @ApiBody({ type: RecoverPasswordValidationDto })
  @ApiResponse({ status: HttpStatus.OK, type: ApiEmptyDataResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Post('password/recover/validate_otp')
  async recoverPasswordValidateOtp(@Req() req: Request) {
    try {
      const { body, headers } = req;
      const lang = headers[HeaderName.LANG] as string | undefined;
      const { otp, token, password } = new RecoverPasswordValidationDto(body);

      const user = await this.authService.validatePasswordResetOtp(
        { otp, token },
        true,
      );
      await this.userService.updatePassword(
        user._id.toString(),
        { password },
        lang,
        true,
      );

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
