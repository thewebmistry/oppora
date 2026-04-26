/**
 * Custom error class for operational errors.
 * Includes statusCode and isOperational flag.
 */
class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Ensure proper prototype chain for instanceof
    Object.setPrototypeOf(this, AppError.prototype);

    // Capture stack trace (excluding constructor call)
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export default AppError;