import { Injectable } from '@nestjs/common';
import { SwabSampleTypeService } from './swab-sample-type.service';

@Injectable()
export class SwabSampleTypeSeedService {
  constructor(private readonly swabSampleTypeService: SwabSampleTypeService) {}

  async seed(): Promise<void> {
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

      const swabSampleType = this.swabSampleTypeService.make(props);

      const existSwabSampleType = await this.swabSampleTypeService.findOneBy({
        swabSampleTypeName: swabSampleType.swabSampleTypeName,
      });

      if (existSwabSampleType) {
        swabSampleType.id = existSwabSampleType.id;
      }

      await this.swabSampleTypeService.save(swabSampleType);
    }
  }
}
