export type ErrorDetail = {
  code: number;
  clean_message: string;
  message: string;
};

export class ErrorResult extends Error {
  readonly details: ErrorDetail[] = [];
  readonly code: number;

  constructor(error: ErrorDetail[] | ErrorDetail) {
    super();

    const errors = Array.isArray(error) ? error : [error];
    this.details = errors.map((e) => ({
      code: e.code,
      clean_message: e.clean_message,
      message: e.message,
    }));

    this.code = this.details[0].code;
  }
}

export class SuccessResult<T> {
  readonly data: T;

  constructor(data: T) {
    this.data = data;
  }
}
