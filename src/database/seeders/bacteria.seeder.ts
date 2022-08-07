import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Bacteria } from '~/lab/entities/bacteria.entity';

export default class BacteriaSeeder implements Seeder {
    public async run(
        dataSource: DataSource
    ): Promise<any> {
        const bacteriaRepository = dataSource.getRepository(Bacteria);

        let bacteria = [
            { bacteriaName: 'Listeria' }
        ];

        await bacteriaRepository.upsert(bacteria, ['bacteriaName']);
    }
}