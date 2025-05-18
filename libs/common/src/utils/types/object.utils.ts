import mongoose from 'mongoose';

export class ObjectUtils {
  /**
   * Merge objects. It  copy attribute from the src object to the des object
   */
  static mergeInto(from: Record<string, any>, dest: Record<string, any>) {
    Object.assign(dest, { ...from });
  }

  /**
   * Make a deep copy of an object
   */
  static deepCopy<T>(input: T) {
    return JSON.parse(JSON.stringify(input)) as T;
  }

  /**
   * Check whether a json stringified is valid or not
   */
  static isValidJSON(text: string): boolean {
    try {
      JSON.parse(text);
      return true;
    } catch {
      return false;
    }
  }

  static prettyJSON(value: any, space = 4): string {
    return JSON.stringify(value, null, space);
  }

  /**
   * Check that an object has a certain property
   */
  static hasProperty<T extends object>(obj: T, property: string): boolean {
    return property in obj;
  }

  static flatten(obj: object, prefix = '') {
    const flattened = {};

    Object.keys(obj).forEach((key) => {
      if (this.hasProperty(obj, key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        const item = obj[key] as unknown;

        if (this.isMongoIdInstance(item)) {
          flattened[newKey] = item.toString();
        } else if (item instanceof Date) {
          flattened[newKey] = item.toISOString();
        } else if (item && typeof item === 'object') {
          Object.assign(flattened, this.flatten(item, newKey));
        } else {
          flattened[newKey] = item;
        }
      }
    });

    return flattened;
  }

  static removeKeys(obj: object, keys: string[] = []) {
    const filtered = Array.isArray(obj) ? [] : {};

    if (obj && (Array.isArray(obj) || typeof obj === 'object')) {
      Object.keys(obj).forEach((key) => {
        if (keys.includes(key)) return;

        const item = obj[key] as unknown;
        if (item && typeof item === 'object') {
          filtered[key] = this.removeKeys(item, keys);
        } else {
          filtered[key] = item;
        }
      });
    }

    return filtered;
  }

  static isMongoIdInstance(id: any): id is mongoose.Types.ObjectId {
    return id instanceof mongoose.Types.ObjectId;
  }
}
