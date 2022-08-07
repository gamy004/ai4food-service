import { ArrayNotEmpty, ArrayUnique, IsArray, Length } from "class-validator";

export class CheckProductDto {
    @IsArray()
    @ArrayNotEmpty()
    @Length(8, 8, { each: true })
    @ArrayUnique()
    productCodes?: string[];
}
