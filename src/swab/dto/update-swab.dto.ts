import { PartialType } from '@nestjs/swagger';
import { CreateSwabDto } from './create-swab.dto';

export class UpdateSwabDto extends PartialType(CreateSwabDto) {}
