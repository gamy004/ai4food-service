import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { CrudService } from '~/common/services/abstract.crud.service';
import { CheckProductDto } from '../dto/check-product.dto';
import {
  ParamGetProductDeletePermissionDto,
  ResponseGetProductDeletePermissionDto,
} from '../dto/get-product-delete-permission.dto';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductService extends CrudService<Product> {
  constructor(
    @InjectRepository(Product)
    repository: Repository<Product>,
  ) {
    super(repository);
  }

  async check(checkProductDto: CheckProductDto) {
    const result = {};

    const where: FindOptionsWhere<Product> = {};

    if (checkProductDto.productCodes) {
      checkProductDto.productCodes.forEach(
        (productCode) => (result[productCode] = null),
      );

      where.productCode = In(checkProductDto.productCodes);
    }

    const products = await this.repository.find({
      where,
      select: {
        id: true,
        productCode: true,
      },
    });

    products.forEach((product) => {
      result[product.productCode] = product.id;
    });

    return result;
  }

  async getDeletePermission(
    param: ParamGetProductDeletePermissionDto,
  ): Promise<ResponseGetProductDeletePermissionDto> {
    let canDelete = true;
    let message = '';

    const productWithRelations = await this.repository.findOneOrFail({
      where: { id: param.id },
      relations: {
        swabAreaHistories: true,
        swabProductHistories: true,
        productSchedules: true,
      },
      select: {
        id: true,
        swabAreaHistories: {
          id: true,
        },
        swabProductHistories: {
          id: true,
        },
        productSchedules: {
          id: true,
        },
      },
    });

    const {
      swabAreaHistories = [],
      swabProductHistories = [],
      productSchedules = [],
    } = productWithRelations;

    const countSwabAreaHistories = swabAreaHistories.length;
    const countSwabProductHistories = swabProductHistories.length;
    const countProductSchedules = productSchedules.length;

    const hasRelations =
      countSwabAreaHistories > 0 ||
      countSwabProductHistories > 0 ||
      countProductSchedules > 0;

    if (hasRelations) {
      canDelete = false;
      message = 'Cannot delete, entity has related data.';
    }

    return {
      canDelete,
      message,
      countSwabAreaHistories,
      countSwabProductHistories,
      countProductSchedules,
    };
  }
}
