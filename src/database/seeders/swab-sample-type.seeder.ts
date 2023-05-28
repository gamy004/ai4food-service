import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { SwabSampleType } from '~/swab/entities/swab-sample-type.entity';

export default class SwabSampleTypeSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const swabSampleTypeRepository = dataSource.getRepository(SwabSampleType);

    let swabSampleTypes = [
      {
        swabSampleTypeName: 'ข้าว',
      },
      {
        swabSampleTypeName: 'กับ',
      },
    ];

    for (let index = 0; index < swabSampleTypes.length; index++) {
      let props = swabSampleTypes[index];

      const swabSampleType = swabSampleTypeRepository.create(props);

      const existSwabSampleType = await swabSampleTypeRepository.findOneBy({
        swabSampleTypeName: swabSampleType.swabSampleTypeName,
      });

      if (existSwabSampleType) {
        swabSampleType.id = existSwabSampleType.id;
      }

      await swabSampleTypeRepository.save(swabSampleType);
    }
  }
}
