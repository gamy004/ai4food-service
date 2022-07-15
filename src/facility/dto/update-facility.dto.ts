import { PartialType, PickType } from '@nestjs/swagger';
import { CreateFacilityDto } from './create-facility.dto';

export class UpdateFacilityDto extends PickType(CreateFacilityDto, ['facilityName']) { }
