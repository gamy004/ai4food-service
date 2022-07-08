import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CrudService } from '~/common/services/abstract.crud.service';
import { ProductExistsRule } from './validators/product-exists-validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product])
  ],
  controllers: [ProductController],
  providers: [
    // {
    //   provide: 'CrudService<Product>',
    //   useClass: ProductService
    // },
    ProductService,
    ProductExistsRule
  ]
})
export class ProductModule { }
