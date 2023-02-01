import { FacilityItem } from '~/facility/entities/facility-item.entity';
import { Facility } from '~/facility/entities/facility.entity';
import { Product } from '~/product/entities/product.entity';
import { SwabProductHistory } from '../entities/swab-product-history.entity';

export class ResponseSwabProductDto {
  swabProductHistories: SwabProductHistory[];
  products: Product[];
  facilities: Facility[];
  facilityItems: FacilityItem[];
  total: number;
}
