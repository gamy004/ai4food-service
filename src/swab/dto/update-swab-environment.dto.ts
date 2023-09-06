import { PartialType } from '@nestjs/swagger';
import { CreateSwabEnvironmentDto } from './create-swab-environment.dto';

export class UpdateSwabEnvironmentDto extends PartialType(
  CreateSwabEnvironmentDto,
) {}
