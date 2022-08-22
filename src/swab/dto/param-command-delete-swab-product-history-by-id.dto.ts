import { IsUUID, Validate } from "class-validator";
import { SwabProductHistoryExistsRule } from "../validators/swab-product-history-exists-validator";

export class ParamCommandDeleteSwabProductByIdDto {
    @IsUUID()
    @Validate(SwabProductHistoryExistsRule)
    id: string;
}