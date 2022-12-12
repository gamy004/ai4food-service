import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { RiskZone } from '~/facility/entities/risk-zone.entity';

export default class RiskZoneSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const riskZoneRepository = dataSource.getRepository(RiskZone);

    let riskZones = [
      {
        riskZoneName: 'Low Risk Floor 1'
      },
      {
        riskZoneName: 'Low Risk Floor 2'
      },
      {
        riskZoneName: 'Low Risk Floor 3'
      },
      {
        riskZoneName: 'Medium Risk'
      },
      {
        riskZoneName: 'High Risk'
      },
    ];

    await riskZoneRepository.upsert(riskZones, ['riskZoneName']);
  }
}
