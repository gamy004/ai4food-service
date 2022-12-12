import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { ContactZone } from '~/facility/entities/contact-zone.entity';

export default class ContactZoneSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const ContactZoneRepository = dataSource.getRepository(ContactZone);

    let contactZones = [
      {
        contactZoneName: 'Zone 1',
        contactZoneDescription: 'Food Contact surface',
      },
      {
        contactZoneName: 'Zone 2',
        contactZoneDescription: 'Indirect Food Contact surface',
      },
      {
        contactZoneName: 'Zone 3',
        contactZoneDescription: 'Non Food Contact surface',
      },
    ];

    await ContactZoneRepository.upsert(contactZones, ['contactZoneName']);
  }
}
