import { PartialType } from '@nestjs/swagger';
import { CreateSwabPeriodDto } from './create-swab-period.dto';

export class UpdateSwabPeriodDto extends PartialType(CreateSwabPeriodDto) {}
