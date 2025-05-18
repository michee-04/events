import { cipher } from '@digitaltg/cipher-cb';

export class CipherService {
  static encrypt(data: unknown, key: string, iv: string) {
    const cph = cipher(Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));

    let input = data;
    if (typeof input !== 'string') {
      if (typeof input === 'object') {
        input = JSON.stringify(input);
      } else {
        throw new Error('Input type must be a string or an object');
      }
    }
    return cph.encrypt(input) as string;
  }

  static decrypt(input: string, key: string, iv: string, parse = false) {
    const cph = cipher(Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    const { text } = cph.decrypt(input);
    if (parse === true) {
      return JSON.parse(text) as Record<string, any>;
    }
    return text as string;
  }
}
