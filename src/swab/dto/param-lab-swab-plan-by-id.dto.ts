import { IsOptional, IsUUID, Validate } from "class-validator";
import { SwabAreaHistoryExistsRule } from "../validators/swab-area-history-exists-validator";

export class ParamLabSwabPlanByIdDto {
    @IsUUID()
    @Validate(SwabAreaHistoryExistsRule)
    id!: string;
}