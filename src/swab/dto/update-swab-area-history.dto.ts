import { PartialType } from '@nestjs/swagger';
import { CreateSwabAreaHistoryDto } from './create-swab-area-history.dto';

export class UpdateSwabAreaHistoryDto extends PartialType(CreateSwabAreaHistoryDto) {}
