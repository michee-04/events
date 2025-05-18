import * as jsonLogic from 'json-logic-js';

jsonLogic.add_operation('Object', Object);
jsonLogic.add_operation('date', date);
jsonLogic.add_operation('dateDiff', dateDiff);

export class JsonLogicRunner {
  /** Check if the provided json logic is valid */
  static isValid(logic: any) {
    return jsonLogic.is_logic(logic);
  }

  /** Validate some data based on the json logic rules */
  static execToBoolean(
    rules: jsonLogic.RulesLogic<jsonLogic.AdditionalOperation>,
    data: any,
  ): boolean {
    return jsonLogic.apply(rules, data);
  }

  /** Validate some data based on the json logic rules */
  static execToString(
    rules: jsonLogic.RulesLogic<jsonLogic.AdditionalOperation>,
    data: any,
  ): string {
    return jsonLogic.apply(rules, data);
  }
}

function date(d: number | string | Date) {
  return d === 'now' ? new Date() : new Date(d);
}

function dateDiff(d1: Date, d2: Date, t: 'd' | 'm' | 'y' = 'd') {
  const diff = Math.abs(d1.getTime() - d2.getTime());

  if (t === 'd') {
    const res = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return res;
  }

  if (t === 'm') {
    const yearDiff = Math.abs(d1.getFullYear() - d2.getFullYear());
    const monthDiff = Math.abs(d1.getMonth() - d2.getMonth());
    return yearDiff * 12 + monthDiff;
  }

  return Math.abs(d1.getFullYear() - d2.getFullYear());
}
