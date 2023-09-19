import { ValidatorConstraint } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RelationFieldValidator } from './abstract-relation-field-validator';

@Injectable()
@ValidatorConstraint({ name: 'relation-field', async: true })
export class RelationField extends RelationFieldValidator {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }
}
