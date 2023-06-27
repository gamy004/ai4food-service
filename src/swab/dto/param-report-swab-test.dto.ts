import { IsNumber, Validate } from 'class-validator';
import { SwabTestExistsRule } from '../validators/swab-test-exists-validator';
import { Type } from 'class-transformer';

export class ParamReportSwabTestDto {
  @Type(() => Number)
  @IsNumber()
  @Validate(SwabTestExistsRule)
  id: number;
}
