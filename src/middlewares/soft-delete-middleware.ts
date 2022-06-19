import { Prisma } from '@prisma/client';

export function softDeleteMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    // WIP: add soft delete functionality

    const result = await next(params);

    return result;
  };
}
