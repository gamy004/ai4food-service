import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { SwabEnvironment } from '~/swab/entities/swab-environment.entity';

export default class SwabEnvironmentSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        const swabEnvironmentRepository = dataSource.getRepository(SwabEnvironment);

        let swabEnvironments = [
            {
                swabEnvironmentName: "มีความชื้น"
            },
            {
                swabEnvironmentName: "มีน้ำขัง"
            },
            {
                swabEnvironmentName: "มีเศษอาหาร"
            },
            {
                swabEnvironmentName: "มีคราบสกปรก"
            },
            {
                swabEnvironmentName: "มีรอยแตก"
            },
            {
                swabEnvironmentName: "มีรอยแยก"
            },
            {
                swabEnvironmentName: "มีร่อง/มีรู"
            },
            {
                swabEnvironmentName: "มีผิวขรุขระ"
            },
            {
                swabEnvironmentName: "มีเกลียว"
            },

        ];

        await swabEnvironmentRepository.upsert(swabEnvironments, ['swabEnvironmentName']);
    }
}