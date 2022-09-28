import { Controller, Post, Body, Get, Put, Param, Delete } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
// import { UpdateProductDto } from './dto/update-product.dto';
// import { CrudService } from '~/common/services/abstract.crud.service';
// import { Product } from './entities/product.entity';
import { CheckProductDto } from './dto/check-product.dto';
import {
  BodyUpdateProductDto,
  ParamUpdateProductDto,
} from './dto/update-product.dto';
import { ParamDeleteProductDto } from './dto/delete-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll() {
    return this.productService.find();
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

    const product = await this.productService.findOneByOrFail(param);

    return this.productService.removeOne(product);
  }
}
