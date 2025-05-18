import { DateUtils, ObjectUtils } from '@app/common/utils';
import * as jwt from 'jsonwebtoken';
import * as ms from 'ms';

export class JwtSignatureService {
  static async signPayload(
    payload: any,
    secret: string,
    options: jwt.SignOptions,
  ) {
    if (!secret) {
      throw new Error('Authentication jwt signature key is not set');
    }

    if (!options.expiresIn) {
      throw new Error('Authentication exprire duration is not provided');
    }

    if (!options.issuer) {
      throw new Error('Authentication jwt issuer is not provided');
    }

    const expiresIn = (options.expiresIn || '1h') as ms.StringValue;
    const mss = ms(expiresIn);

    const jwtOptions = ObjectUtils.deepCopy(options);

    return {
      token: await this.signAsync(payload, secret, {
        expiresIn: options.expiresIn,
        audience: 'account',
        issuer: options.issuer,
        algorithm: 'HS512',
        ...jwtOptions,
      }),
      expiresAt: DateUtils.addMillis(new Date(), mss).getTime(),
    };
  }

  static verifyPayload(token: string, secret: string) {
    try {
      return this.verifyAsync(token, secret);
    } catch (error) {
      throw Error('Token validation failed: ' + error.message);
    }
  }

  static signAsync(
    payload: string | Buffer | object,
    secretOrPrivateKey: jwt.Secret | jwt.PrivateKey,
    options: jwt.SignOptions,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, secretOrPrivateKey, options, (err, token) =>
        err ? reject(err) : resolve(token as string),
      );
    });
  }

  static verifyAsync<T extends object = any>(
    token: string,
    secretOrPublicKey: jwt.Secret | jwt.PublicKey | jwt.GetPublicKeyOrSecret,
    options?: jwt.VerifyOptions,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secretOrPublicKey, options, (err, decoded) =>
        err ? reject(err) : resolve(decoded as T),
      );
    });
  }
}
