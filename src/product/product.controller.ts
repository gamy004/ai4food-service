import { Controller, Post, Body, Get } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
// import { UpdateProductDto } from './dto/update-product.dto';
// import { CrudService } from '~/common/services/abstract.crud.service';
// import { Product } from './entities/product.entity';
import { CheckProductDto } from './dto/check-product.dto';

@Controller('product')
export class ProductController {
  constructor(
    // @Inject('CrudService<Product>')
    // private readonly productService: CrudService<Product>
    private readonly productService: ProductService
  ) { }

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
}
