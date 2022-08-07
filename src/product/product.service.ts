import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { CrudService } from '~/common/services/abstract.crud.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CheckProductDto } from './dto/check-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService extends CrudService<Product> {
  constructor(
    @InjectRepository(Product)
    repository: Repository<Product>
  ) {
    super(repository);
  }

  async check(checkProductDto: CheckProductDto) {
    const result = {};

    const where: FindOptionsWhere<Product> = {};

    if (checkProductDto.productCodes) {
      checkProductDto.productCodes.forEach(productCode => result[productCode] = null);

      where.productCode = In(checkProductDto.productCodes);
    }

    const products = await this.repository.find({
      where,
      select: {
        id: true,
        productCode: true
      }
    });

    products.forEach(product => {
      result[product.productCode] = product.id;
    });

    return result;
  }
}
