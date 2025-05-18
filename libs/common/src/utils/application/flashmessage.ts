import { ErrorResult } from '../domain/result';

export class ControllerFlashMessage {
  static setFlash(error: any, fn: (msg: string) => void | null) {
    if (error instanceof ErrorResult) {
      const msg = error.details
        .map((e) => {
          if (fn) {
            fn(e.clean_message);
          }
          return e.clean_message;
        })
        .join(' -- ');

      return msg;
    }

    if (error instanceof Error) {
      if (fn) {
        fn(error.message);
      }
      return error.message;
    }

    return `Une erreur inconne s'est produite.`;
  }
}
