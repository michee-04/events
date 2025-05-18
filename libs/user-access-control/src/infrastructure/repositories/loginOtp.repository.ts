import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MAIN_DATABASE_CONNECTION_NAME } from '@app/common/constants';
import { BaseRepository } from '@app/core/providers/base.mongo.repository';
import { LoginOtp } from '../models/loginOtp';

@Injectable()
export class LoginOtpRepository extends BaseRepository<LoginOtp> {
  constructor(
    @InjectModel(LoginOtp.name, MAIN_DATABASE_CONNECTION_NAME)
    model: Model<LoginOtp>,
  ) {
    super(model);
  }

  async getOneByOtpAndToken(otp: string, token: string) {
    return this.getOne({ otp, token });
  }

  async getOneByToken(token: string) {
    return this.getOne({ token });
  }

  async getOneActiveByToken(token: string) {
    return this.getOne({ token, checked: false });
  }

  async getLastOneByEmail(email: string) {
    return this.getOne({ email }, { createdAt: -1 });
  }
}
