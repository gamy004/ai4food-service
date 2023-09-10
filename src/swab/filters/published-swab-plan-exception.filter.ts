import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PublishedSwabPlanException } from '../exceptions/published-swab-plan.exception';

@Catch(PublishedSwabPlanException)
export class PublishedSwabPlanExceptionFilter implements ExceptionFilter {
  catch(exception: PublishedSwabPlanException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus() ?? HttpStatus.CONFLICT;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exception.message,
    });
  }
}
