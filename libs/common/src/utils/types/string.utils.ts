import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';

export class StringUtils {
  static generateRandomStringBase(alphabet: string, length: number = 20) {
    const nanoid = customAlphabet(alphabet, length);
    return nanoid();
  }

  static generateRandomNumber(length?: number) {
    return this.generateRandomStringBase('0123456789', length);
  }

  static generateRandomString(length?: number) {
    return this.generateRandomStringBase(
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      length,
    );
  }

  static removeAccents(text: string = ''): string {
    return text
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  static slugify(str: string = ''): string {
    return this.removeAccents(str)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  /**
   * Validate an international phone number
   */
  static isPhone(phone: string = ''): boolean {
    return /^\+\d{1,15}$/.test(phone);
  }

  /**
   * Validate an email address
   */
  static isEmail(email: string = ''): boolean {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  }

  /**
   * Check if an OTP code is in the correct format
   */
  static isOtp(otp: string = ''): boolean {
    return /^\d{6}$/.test(otp);
  }

  static maskEmail(email: string = ''): string {
    const [localPart, domain] = email.split('@');
    const maskedLocal = `${localPart.slice(0, 2)}*****`;
    return `${maskedLocal}@${domain}`;
  }

  static maskPhone(phone: string = ''): string {
    const cleanedPhone = phone.replace(/\D/g, '');
    const leading = cleanedPhone.slice(0, 5);
    const trailing = cleanedPhone.slice(-2);
    const maskedMiddle = cleanedPhone.slice(5, -2).replace(/\d/g, '*');
    return `+${leading}${maskedMiddle}${trailing}`;
  }

  // converts a string to a byte array
  static strToByteArray(str: string) {
    return new TextEncoder().encode(str);
  }

  // converts a byte array to a string
  static byteArrayToStr(buf: AllowSharedBufferSource) {
    return new TextDecoder().decode(buf);
  }

  static isMongoId(
    id:
      | string
      | mongoose.mongo.BSON.ObjectId
      | mongoose.mongo.BSON.ObjectIdLike,
  ): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  }

  static toMongoId(id: string) {
    if (this.isMongoId(id)) {
      return new mongoose.Types.ObjectId(id);
    }
    return null;
  }
}
