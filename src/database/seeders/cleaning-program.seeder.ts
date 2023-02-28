import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { CleaningProgram } from '~/cleaning/entities/cleaning-program.entity';

export default class CleaningProgramSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const cleaningProgramRepository = dataSource.getRepository(CleaningProgram);

    let cleaningPrograms = [
      {
        cleaningProgramName: 'P1',
        cleaningProgramDescription: 'โปรแกรมการล้างรายวัน',
      },
      {
        cleaningProgramName: 'P2',
        cleaningProgramDescription: 'โปรแกรมการล้างทุก 2 สัปดาห์',
      },
      {
        cleaningProgramName: 'P3',
        cleaningProgramDescription: 'โปรแกรมการล้างรายเดือน',
      },
    ];

    await cleaningProgramRepository.upsert(cleaningPrograms, [
      'cleaningProgramName',
    ]);
  }
}
