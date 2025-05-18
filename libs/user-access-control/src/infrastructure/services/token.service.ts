import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppConfig } from '@app/core/config';
import { Token } from '../models/token';
import { TokenRepository } from '../repositories/token.repository';

@Injectable()
export class TokenService {
  private readonly isEnabled: boolean = false;

  constructor(
    private readonly config: ConfigService<AppConfig, true>,
    private readonly tokenRepository: TokenRepository,
  ) {
    this.isEnabled = this.config.get('LIB_USER_TOKEN_VALIDATION_ENABLED');
  }

  async save(data: Partial<Token>) {
    if (!this.isEnabled) return;

    const { userId, accessToken, refreshToken, ipAddress, appType } = data;
    await this.tokenRepository.upsert(
      { userId, appType },
      { accessToken, refreshToken, ipAddress, active: true },
    );
  }

  async verifyAccessToken(userId: string, accessToken: string) {
    if (!this.isEnabled) return null;

    const tokenHolder =
      await this.tokenRepository.getActiveByUserAndAccessToken(
        userId,
        accessToken,
      );

    if (!tokenHolder) {
      throw Error(`Le token d'accès est invalide.`);
    }

    return tokenHolder;
  }

  async verifyRefreshToken(userId: string, refreshToken: string) {
    if (this.isEnabled !== true) return null;

    const tokenHolder =
      await this.tokenRepository.getActiveByUserAndRefreshToken(
        userId,
        refreshToken,
      );

    if (!tokenHolder) {
      throw Error('Le refresh token est invalide');
    }

    return tokenHolder;
  }

  async disable(userId: string, accessToken: string) {
    if (!this.isEnabled) return;

    const tokenHolder = await this.verifyAccessToken(userId, accessToken);
    if (!tokenHolder) return;

    await this.tokenRepository.update({ _id: tokenHolder._id, active: false });
  }
}
