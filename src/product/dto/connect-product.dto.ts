import { IsNotEmpty, IsUUID } from "class-validator";

export class ConnectProductDto {
    @IsUUID()
    id?: string;

    @IsNotEmpty()
    productCode?: string;
}
