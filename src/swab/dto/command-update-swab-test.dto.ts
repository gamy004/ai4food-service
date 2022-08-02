import { Type } from "class-transformer";
import { IsNotEmpty, Validate, IsBoolean, IsNumber } from "class-validator";
import { SwabTestExistsRule } from "../validators/swab-test-exists-validator";

export class ParamUpdateSwabTestDto {
    @Type(() => Number)
    @IsNumber()
    @Validate(SwabTestExistsRule)
    id: string;

}

export class BodyUpdateSwabTestDto {
    @IsNotEmpty()
    @IsBoolean()
    listeriaMonoDetected!: boolean;

}