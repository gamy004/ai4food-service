import { IsUUID, Validate } from 'class-validator';
import { SwabSampleTypeExistsRule } from '../validators/swab-sample-type-exists-validator';

export class ConnectSwabSampleTypeDto {
  @IsUUID()
  @Validate(SwabSampleTypeExistsRule)
  id: string;
}
