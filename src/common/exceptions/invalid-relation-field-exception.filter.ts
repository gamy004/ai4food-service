import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { InvalidRelationFieldException } from './invalid-relation-field.exception';

@Catch(InvalidRelationFieldException)
export class InvalidRelationFieldExceptionFilter implements ExceptionFilter {
  catch(exception: InvalidRelationFieldException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus() ?? HttpStatus.CONFLICT;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exception.message ?? 'Invalid relation field',
    });
  }
}
