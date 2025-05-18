import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrcodeService {
  constructor() {}

  async generate(str: string, options: QRCode.QRCodeOptions) {
    return QRCode.toDataURL(str, options);
  }
}
