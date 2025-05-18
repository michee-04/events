import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

export class PasswordService {
  /** Hash a password */
  static async hashPassword(password: string, length = 20, rounds = 10) {
    const salt = nanoid(length);
    const hashedPassword = await bcrypt.hash(password + salt, rounds);
    return { salt, hashedPassword };
  }

  /** Check if a given password match a hashed password */
  static async isPasswordMatch(
    salt: string,
    password: string,
    hashedPassword: string,
  ) {
    return await bcrypt.compare(password + salt, hashedPassword);
  }
}
