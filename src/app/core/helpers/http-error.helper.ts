import { HttpErrorResponse } from '@angular/common/http';
import { UiHttpError } from '../interfaces/http-error.interface';

export function mapHttpErrorToUi(error: unknown): UiHttpError {
  const fallback: UiHttpError = {
    statusCode: 500,
    message: 'An internal server error has occurred. Please try again later.',
  };

  if (!(error instanceof HttpErrorResponse)) return fallback;

  const statusCode = error.status ?? 500;

  if (statusCode >= 400 && statusCode < 500) {
    const msg =
      typeof error.error?.message === 'string'
        ? error.error.message
        : typeof error.message === 'string'
          ? error.message
          : 'Request error.';
    return { statusCode, message: msg };
  }

  return fallback;
}



