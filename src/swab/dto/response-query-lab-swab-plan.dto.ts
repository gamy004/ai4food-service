import { FacilityItem } from '~/facility/entities/facility-item.entity';
import { Facility } from '~/facility/entities/facility.entity';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';
import { SwabArea } from '../entities/swab-area.entity';
import { SwabPeriod } from '../entities/swab-period.entity';
import { SwabTest } from '../entities/swab-test.entity';

export class ResponseQueryLabSwabPlanDto {
  swabAreaHistories: SwabAreaHistory[];

  swabTests: SwabTest[];

  swabAreas: SwabArea[];

  swabPeriods: SwabPeriod[];

  facilities: Facility[];

  facilityitems: FacilityItem[];

  total: number;
}
