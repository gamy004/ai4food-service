import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CrudService } from '~/common/services/abstract.crud.service';

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
    ProductService
  ]
})
export class ProductModule { }
