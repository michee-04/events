import { Request } from 'express';

export class HttpUtils {
  static getIp(req: Request) {
    return req.ips.length ? req.ips[0] : req.ip!;
  }
}
