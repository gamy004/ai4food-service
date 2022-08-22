import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { EntityNotFoundError } from 'typeorm';

@Catch(EntityNotFoundError)
export class EntityNotFoundExceptionFilter implements ExceptionFilter {
    catch(error: EntityNotFoundError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        console.log(request, response);

        response
            .status(HttpStatus.NOT_FOUND)
            .json({
                statusCode: HttpStatus.NOT_FOUND,
                error: "Not Found",
                message: [
                    "entity doesn't exists"
                ],
            });
    }
}