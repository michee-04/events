import { JournalService } from '@app/journal/domain/services/journal.service';
import { UserService } from '@app/user-access-control/domain/services/user.service';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  LogLevel,
  Put,
  Req,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  ApiEmptyDataResponse,
  ApiErrorResponse,
  HeaderName,
} from 'src/modules/core/http';
import {
  ProfileResponse,
  UpdateEmailDto,
  UpdatePasswordDto,
  UpdateProfileDto,
} from '../../dto';
import { UpdatePhoneDto } from '../../dto/request/update-phone.request';

@ApiTags('Auth - User Account')
@Controller('account')
export class AccountController {
  constructor(
    private readonly userService: UserService,
    private readonly journalService: JournalService,
  ) {}

  @ApiOperation({
    summary: "Récupérer les informations du profil de l'utilisateur connecté",
  })
  @ApiResponse({ status: HttpStatus.OK, type: ProfileResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Get()
  async profile(@Req() req: Request) {
    try {
      return this.userService.getPublicInfo(req.user!);
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({
    summary:
      "Mettre à jour les informations du profil de l'utilisateur connecté",
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: HttpStatus.OK, type: ApiEmptyDataResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Put('profile')
  async updateProfile(@Req() req: Request) {
    try {
      const { body, headers } = req;
      const lang = headers[HeaderName.LANG] as string | undefined;
      const input = new UpdateProfileDto(body);

      await this.userService.updateProfile(
        req.user!._id.toString(),
        { ...input },
        lang,
      );

      return null;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({
    summary: "Mettre à jour l'adresse e-mail de l'utilisateur connecté",
  })
  @ApiBody({ type: UpdateEmailDto })
  @ApiResponse({ status: HttpStatus.OK, type: ApiEmptyDataResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Put('email')
  async updateEmail(@Req() req: Request) {
    try {
      const { body, headers } = req;
      const lang = headers[HeaderName.LANG] as string | undefined;
      const input = new UpdateEmailDto(body);

      await this.userService.updateProfile(
        req.user!._id.toString(),
        { ...input },
        lang,
      );

      return null;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({
    summary: "Mettre à jour le numéro de téléphone de l'utilisateur connecté",
  })
  @ApiBody({ type: UpdatePhoneDto })
  @ApiResponse({ status: HttpStatus.OK, type: ApiEmptyDataResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Put('phone')
  async updatePhone(@Req() req: Request) {
    try {
      const { body, headers } = req;
      const lang = headers[HeaderName.LANG] as string | undefined;
      const input = new UpdatePhoneDto(body);

      await this.userService.updateProfile(
        req.user!._id.toString(),
        { ...input },
        lang,
      );

      return null;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
  }

  @ApiOperation({
    summary: "Mettre à jour le mot de passe de l'utilisateur connecté",
  })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({ status: HttpStatus.OK, type: ApiEmptyDataResponse })
  @ApiResponse({ status: '4XX', type: ApiErrorResponse })
  @ApiResponse({ status: '5XX', type: ApiErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Put('password')
  async updatePassword(@Req() req: Request) {
    try {
      const { body, headers } = req;
      const lang = headers[HeaderName.LANG] as string | undefined;
      const input = new UpdatePasswordDto(body);

      await this.userService.updatePassword(
        req.user!._id.toString(),
        { ...input },
        lang,
      );

      return null;
    } catch (error) {
      this.log('error', '', error);
      throw error;
    }
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
