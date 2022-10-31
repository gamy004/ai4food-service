import { Type } from 'class-transformer';
import {
  Validate,
  IsNumber,
  ValidateNested,
  IsOptional,
  IsUUID,
  IsDateString,
  IsArray,
} from 'class-validator';
import { ConnectUserDto } from '~/auth/dto/connect-user.dto';
import { BacteriaSpecieExistsRule } from '~/lab/validators/bacteria-specie-exists-validator';
import { SwabTestExistsRule } from '../validators/swab-test-exists-validator';

export class ParamUpdateSwabTestDto {
  @Type(() => Number)
  @IsNumber()
  @Validate(SwabTestExistsRule)
  id: number;
}

export class CommandUpdateSwabTestBacteriaSpecieDto {
  @IsDateString()
  bacteriaSpecieRecordedAt: Date;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ConnectUserDto)
  recordedUser: ConnectUserDto;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  @Validate(BacteriaSpecieExistsRule, { each: true })
  bacteriaSpecies: string[];
}
