import { HttpStatus } from '@nestjs/common';

export class InvalidRelationFieldException extends Error {
  private status: number;

  constructor(message: string, status: number = HttpStatus.CONFLICT) {
    super(message);

    this.status = status;
  }

  getStatus(): number {
    return this.status;
  }
}
