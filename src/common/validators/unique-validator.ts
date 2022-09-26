import { ValidatorConstraint } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UniqueValidator } from './abstract-unique-validator';

@Injectable()
@ValidatorConstraint({ name: 'unique', async: true })
export class Unique extends UniqueValidator {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }
}
