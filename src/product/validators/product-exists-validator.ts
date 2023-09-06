import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatorConstraint } from 'class-validator';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { EntityExistsRule } from '~/common/validators/entity-exists-validator';
import { Product } from '../entities/product.entity';

@ValidatorConstraint({ name: 'ProductExists', async: true })
@Injectable()
export class ProductExistsRule extends EntityExistsRule<Product> {
  constructor(
    @InjectRepository(Product)
    repository: CommonRepositoryInterface<Product>,
  ) {
    super(repository);
  }
}
