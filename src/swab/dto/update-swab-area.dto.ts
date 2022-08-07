import { PartialType } from '@nestjs/swagger';
import { CreateSwabAreaDto } from './create-swab-area.dto';

export class UpdateSwabAreaDto extends PartialType(CreateSwabAreaDto) { }
