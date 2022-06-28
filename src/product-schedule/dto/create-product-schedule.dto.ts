import { Product } from "~/product/entities/product.entity";

export class CreateProductScheduleDto {
    productScheduleAmount: number;

    productScheduleDate: Date;

    productScheduleEndedAt: Date;

    productScheduleStartedAt: Date;

    product: Product;
}
