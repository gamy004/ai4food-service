import { FacilityItem } from '~/facility/entities/facility-item.entity';
import { Facility } from '~/facility/entities/facility.entity';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';
import { SwabArea } from '../entities/swab-area.entity';

export class ResponseQueryUpdateSwabPlanV2Dto {
  total: number;

  swabAreaHistories: SwabAreaHistory[];

  subSwabAreaHistories: SwabAreaHistory[];

  swabAreas: SwabArea[];

  facilities: Facility[];

  facilityItems: FacilityItem[];
}
