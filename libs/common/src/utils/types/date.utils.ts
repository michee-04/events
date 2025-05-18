export class DateUtils {
  /**
   * Add hour to a date
   */
  static addHours(date: Date, hours: number): Date {
    date.setHours(date.getHours() + hours);
    return date;
  }

  /**
   * Substract hours from a date
   */
  static substractHours(date: Date, hours: number): Date {
    date.setHours(date.getHours() - hours);
    return date;
  }

  /**
   * Add minutes to date
   */
  static addMinutes(date: Date, minutes: number): Date {
    date.setMinutes(date.getMinutes() + minutes);
    return date;
  }

  /**
   * Add milliseconds to date
   */
  static addMillis(date: Date, millis: number): Date {
    date.setMilliseconds(date.getMilliseconds() + millis);
    return date;
  }

  /**
   * Compute difference between two dates in hours
   */
  static diffHours(date1: Date, date2: Date): number {
    let diff = (date1.getTime() - date2.getTime()) / 1000;
    diff /= 60 * 60;
    return Math.abs(Math.round(diff));
  }

  /**
   * Compute difference between two dates in milliseconds
   */
  static diffMillis(date1: Date, date2: Date): number {
    const diff = Math.abs(date1.getTime() - date2.getTime());
    return Math.floor(diff);
  }

  /**
   * Format a date to YYYY-MM-DD string
   */
  static format(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Validate a date string in YYYY-MM-DD format
   */
  static isValid(dateString: string = ''): boolean {
    // Verify format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return false;
    }

    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  /**
   * Check if target date is before source date
   */
  static isBefore(
    targetDate: string | Date,
    sourceDate: string | Date,
    ignoreTime: boolean = true,
  ): boolean {
    return this.#compare(targetDate, sourceDate, 'lt', ignoreTime);
  }

  /**
   * Check if target date is after source date
   */
  static isAfter(
    targetDate: string | Date,
    sourceDate: string | Date,
    ignoreTime: boolean = true,
  ): boolean {
    return this.#compare(targetDate, sourceDate, 'gt', ignoreTime);
  }

  /**
   * Check if target date is equal to source date
   */
  static isEqual(
    targetDate: string | Date,
    sourceDate: string | Date,
    ignoreTime: boolean = true,
  ): boolean {
    return this.#compare(targetDate, sourceDate, 'eq', ignoreTime);
  }

  /**
   * Compare two dates
   */
  static #compare(
    targetDate: string | Date,
    sourceDate: string | Date,
    operator: 'lt' | 'eq' | 'gt',
    ignoreTime: boolean = true,
  ): boolean {
    let target = targetDate;
    if (typeof target === 'string') {
      target = new Date(target);
    }

    let source = sourceDate;
    if (typeof source === 'string') {
      source = new Date(source);
    }

    if (ignoreTime) {
      target.setHours(0, 0, 0, 0);
      source.setHours(0, 0, 0, 0);
    }

    if (operator === 'lt') {
      return target < source;
    }

    if (operator === 'gt') {
      return target > source;
    }

    return target.getTime() === source.getTime();
  }
}
