import { ErrorResult } from '@app/common/utils';
import { AppConfig } from '@app/core/config';
import { LeanedDocument } from '@app/core/providers/base.mongo.repository';
import {
  AuthService,
  AuthTokenPayload,
} from '@app/user-access-control/domain/services/auth.service';
import { User } from '@app/user-access-control/infrastructure/models/user';
import { UserRepository } from '@app/user-access-control/infrastructure/repositories/user.repository';
import { TokenService } from '@app/user-access-control/infrastructure/services/token.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_ADMIN_KEY, IS_PUBLIC_KEY } from '../decorators';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly queryValidationToken: string;

  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService<AppConfig, true>,
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Handle public request
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Handle auth token
    const user = await this.handleAuthToken(request);

    //* Handle admin request
    const isAdmin = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // TODO: check role assignments (active)?
    if (isAdmin && !user.isAdmin) {
      throw new ErrorResult({
        code: 403_000,
        clean_message: 'Vous ne disposez pas des autorisations nécessaires',
        message: 'Vous ne disposez pas des autorisations nécessaires',
      });
    }

    request.user = user;
    return true;
  }

  private handleAnonymousRequest(request: Request) {
    if (request.query.token !== this.queryValidationToken) {
      throw new ErrorResult({
        code: 401_000,
        clean_message: 'Accès non autorisé',
        message: 'Le paramètre de requête [token] est invalide',
      });
    }

    return true;
  }

  private async handleAuthToken(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      throw new ErrorResult({
        code: 401_006,
        clean_message: "Un token d'accès doit être fourni",
        message: "Un token d'accès (Bearer token) doit être fourni",
      });
    }

    let user: LeanedDocument<User> | null = null;

    try {
      const decoded = (await this.authService.verifyJwtPayload(
        token,
      )) as AuthTokenPayload;

      user = await this.userRepository.getById(decoded.account.id);
      if (!user) {
        throw Error('Le compte est introuvable');
      }

      await this.tokenService.verifyAccessToken(user._id.toString(), token);
    } catch {
      throw new ErrorResult({
        code: 401_000,
        clean_message: 'Accès non autorisé',
        message: "Le token d'accès (Bearer token) est invalide",
      });
    }

    if (!user.active) {
      throw new ErrorResult({
        code: 403_004,
        clean_message: 'Le compte est bloqué',
        message: 'Le compte est bloqué',
      });
    }

    return user;
  }
}
