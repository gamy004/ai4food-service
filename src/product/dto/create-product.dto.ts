import { IsNotEmpty } from "class-validator";

export class CreateProductDto {
    @IsNotEmpty()
    productCode: string;

    @IsNotEmpty()
    productName: string;

    @IsNotEmpty()
    alternateProductCode: string;
}
