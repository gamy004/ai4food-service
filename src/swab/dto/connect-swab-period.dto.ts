import { IsUUID, Validate } from "class-validator";
import { SwabPeriodExistsRule } from "../validators/swab-period-exists-validator";

export class ConnectSwabPeriodDto {
    @IsUUID()
    @Validate(SwabPeriodExistsRule)
    id: string;
}
