import { createHmac } from 'crypto';

/**
 * A utility class for hashing strings and JSON objects using HMAC-SHA512.
 */
export class HashUtils {
  /**
   * Hashes a string using HMAC-SHA512.
   * @param str - The string to hash.
   * @returns The resulting hash as a hexadecimal string.
   * @throws Error if the HMAC_SECRET environment variable is not set.
   */
  static hashString(str: string, secret: string): string {
    const hmac = createHmac('sha512', secret);
    return hmac.update(str).digest('hex');
  }

  /**
   * Hashes a JSON object using HMAC-SHA512.
   * @param json - The JSON object to hash.
   * @returns The resulting hash as a hexadecimal string.
   */
  static hashJson(json: Record<string, any>, secret: string): string {
    return this.hashString(JSON.stringify(json), secret);
  }

  /**
   * Compares a hash with the hash of a JSON object.
   * @param hash - The hash to compare.
   * @param json - The JSON object to hash and compare against.
   * @returns True if the hashes match, false otherwise.
   */
  static compareJsonHash(
    hash: string,
    json: Record<string, any>,
    hmacSecret: string,
  ): boolean {
    return hash === this.hashJson(json, hmacSecret);
  }
}
