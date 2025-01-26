import { ValidationError } from 'class-validator';
import { Request, Response, Next } from 'restify';

export class ErrorHandler {
  /**
   * Handle validation errors from class-validator.
   */
  static handleValidationErrors(errors: ValidationError[], res: Response, next: Next): void {
    const errorMessages = errors.map((error) => Object.values(error.constraints || {})).flat();
    res.send(400, { errors: errorMessages });
    next(false); // Stop the request chain
  }

  /**
   * Handle generic errors (e.g., database errors, application errors).
   */
  static handleGenericError(error: unknown, res: Response, next: Next): void {
    if (error instanceof Error) {
      res.send(500, { error: error.message });
    } else {
      res.send(500, { error: 'An unknown error occurred' });
    }
    next(false); // Stop the request chain
  }
}