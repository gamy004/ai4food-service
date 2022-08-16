import { IsUUID, Validate } from "class-validator";
import { SwabProductHistoryExistsRule } from "../validators/swab-product-history-exists-validator";

export class ParamQuerySwabProductByIdDto {
    @IsUUID()
    @Validate(SwabProductHistoryExistsRule)
    id: string;
}