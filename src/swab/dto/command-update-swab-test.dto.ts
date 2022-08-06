import { Type } from "class-transformer";
import { IsNotEmpty, Validate, IsNumber, ValidateNested, IsOptional, IsUUID, IsDateString } from "class-validator";
import { ConnectUserDto } from "~/auth/dto/connect-user.dto";
import { User } from "~/auth/entities/user.entity";
import { BacteriaExistsRule } from "~/lab/validators/bacteria-exists-validator";
import { BacteriaSpecieExistsRule } from "~/lab/validators/bacteria-specie-exists-validator";
import { SwabTestExistsRule } from "../validators/swab-test-exists-validator";

export class UpsertBacteriaWithBacteriaSpecieDto {
    @IsOptional()
    @IsUUID()
    @Validate(BacteriaExistsRule)
    bacteriaId?: string;

    @IsOptional()
    @IsNotEmpty()
    bacteriaName?: string;

    @IsOptional()
    @IsUUID()
    @Validate(BacteriaSpecieExistsRule)
    bacteriaSpecieId?: string;

    @IsOptional()
    @IsNotEmpty()
    bacteriaSpecieName?: string;
}

export class ParamUpdateSwabTestDto {
    @Type(() => Number)
    @IsNumber()
    @Validate(SwabTestExistsRule)
    id: number;
}

export class BodyUpdateSwabTestDto {
    @IsDateString()
    swabTestRecordedAt: Date;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ConnectUserDto)
    recordedUser: ConnectUserDto;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => UpsertBacteriaWithBacteriaSpecieDto)
    bacteriaSpecies: UpsertBacteriaWithBacteriaSpecieDto[];
}