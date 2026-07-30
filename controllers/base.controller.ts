// controllers/base.controller.ts
import type { Response } from 'express';
import { 
  ValidationError, 
  AuthorizationError, 
  NotFoundError,
  DatabaseError,
  AuthenticationError 
} from '@/lib/errors';
import { logger } from '@/lib/logger';

export class BaseController {
  /**
   * Send success response
   */
  protected sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
    res.status(statusCode).json({
      success: true,
      data,
    });
  }

  /**
   * Send error response
   */
  protected sendError(res: Response, message: string, statusCode: number = 400): void {
    res.status(statusCode).json({
      success: false,
      error: message,
    });
  }

  /**
   * Handle errors
   */
  protected handleError(error: any, res: Response): void {
    logger.error('Request failed', { error: error.message, stack: error.stack });

    if (error instanceof ValidationError) {
      return this.sendError(res, error.message, 400);
    }

    if (error instanceof AuthenticationError) {
      return this.sendError(res, error.message, 401);
    }

    if (error instanceof AuthorizationError) {
      return this.sendError(res, error.message, 403);
    }

    if (error instanceof NotFoundError) {
      return this.sendError(res, error.message, 404);
    }

    if (error instanceof DatabaseError) {
      return this.sendError(res, 'Database error occurred', 500);
    }

    // Unknown error
    return this.sendError(res, 'Internal server error', 500);
  }
}