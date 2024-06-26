import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CheckProductDto } from '../dto/check-product.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { ParamDeleteProductDto } from '../dto/delete-product.dto';
import {
  ParamGetProductDeletePermissionDto,
  ResponseGetProductDeletePermissionDto,
} from '../dto/get-product-delete-permission.dto';
import {
  ParamUpdateProductDto,
  BodyUpdateProductDto,
} from '../dto/update-product.dto';
import { ProductService } from '../services/product.service';

@Controller('product')
@ApiTags('Product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll() {
    return this.productService.find({
      order: {
        createdAt: 'asc',
      },
    });
  }

  @Get(':id/delete-permission')
  getDeletePermission(
    @Param() param: ParamGetProductDeletePermissionDto,
  ): Promise<ResponseGetProductDeletePermissionDto> {
    return this.productService.getDeletePermission(param);
  }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Post('check')
  verify(@Body() checkProductDto: CheckProductDto) {
    return this.productService.check(checkProductDto);
  }

  @Put(':id')
  async update(
    @Param() param: ParamUpdateProductDto,
    @Body() body: BodyUpdateProductDto,
  ) {
    const { productCode, alternateProductCode, productName } = body;

    const product = await this.productService.findOneByOrFail(param);

    product.productCode = productCode;

    product.alternateProductCode = alternateProductCode;

    product.productName = productName;

    return this.productService.save(product);
  }

  @Delete(':id')
  async delete(@Param() param: ParamDeleteProductDto) {
    const { id } = param;
    // Todo: should validate with getDeletePermission ?
    const product = await this.productService.findOneOrFail({
      where: { id },
      relations: {
        productSchedules: true,
        swabAreaHistories: true,
        swabProductHistories: true,
      },
    });

    return this.productService.removeOne(product);
  }
}
