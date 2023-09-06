import { IsUUID, Validate } from 'class-validator';
import { RiskZoneExistsRule } from '../validators/risk-zone-exists-validator';

export class ConnectRiskZoneDto {
  @IsUUID()
  @Validate(RiskZoneExistsRule)
  id!: string;
}
