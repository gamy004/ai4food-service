import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatorConstraint } from 'class-validator';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { EntityExistsRule } from '~/common/validators/entity-exists-validator';
import { ProductSchedule } from '../entities/product-schedule.entity';

@ValidatorConstraint({ name: 'ProductScheduleExists', async: true })
@Injectable()
export class ProductScheduleExistsRule extends EntityExistsRule<ProductSchedule> {
  constructor(
    @InjectRepository(ProductSchedule)
    repository: CommonRepositoryInterface<ProductSchedule>,
  ) {
    super(repository);
  }
}
