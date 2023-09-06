import { Seeder } from 'typeorm-extension';
import { DataSource, DeepPartial } from 'typeorm';
import { Bacteria } from '~/lab/entities/bacteria.entity';
import { BacteriaSpecie } from '~/lab/entities/bacteria-specie.entity';

export default class BacteriaSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const bacteriaRepository = dataSource.getRepository(Bacteria);
    const bacteriaSpecieRepository = dataSource.getRepository(BacteriaSpecie);

    let bacterias = [
      {
        bacteriaName: 'Listeria',
        bacteriaSpecies: [
          { bacteriaSpecieName: 'L.grayi' },
          { bacteriaSpecieName: 'L.innocua' },
          { bacteriaSpecieName: 'L.ivanovii' },
          { bacteriaSpecieName: 'L.monocytogenes' },
          { bacteriaSpecieName: 'L.seeligeri' },
          { bacteriaSpecieName: 'L.welshimeri' },
        ],
      },
    ];

    for (let index = 0; index < bacterias.length; index++) {
      const { bacteriaName, bacteriaSpecies } = bacterias[index];

      const savedBacteriaData: DeepPartial<Bacteria> = {
        bacteriaName,
      };

      const bacteria = await bacteriaRepository.findOneBy({ bacteriaName });

      if (bacteria) {
        savedBacteriaData.id = bacteria.id;
      }

      await bacteriaRepository.save(savedBacteriaData);

      if (bacteria && bacteriaSpecies.length) {
        const savedBacteriaSpecieData: DeepPartial<BacteriaSpecie>[] = [];

        for (
          let bacteriaSpecieIndex = 0;
          bacteriaSpecieIndex < bacteriaSpecies.length;
          bacteriaSpecieIndex++
        ) {
          const { bacteriaSpecieName } = bacteriaSpecies[bacteriaSpecieIndex];

          const savedBacteriaSpecie: DeepPartial<BacteriaSpecie> = {
            bacteriaSpecieName,
            bacteria,
          };

          const bacteriaSpecie = await bacteriaSpecieRepository.findOneBy({
            bacteriaSpecieName,
          });

          if (bacteriaSpecie) {
            savedBacteriaSpecie.id = bacteriaSpecie.id;
          }

          savedBacteriaSpecieData.push(savedBacteriaSpecie);
        }

        await bacteriaSpecieRepository.save(savedBacteriaSpecieData);
      }
    }
  }
}
