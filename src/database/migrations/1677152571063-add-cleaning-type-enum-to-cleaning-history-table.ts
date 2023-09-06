import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCleaningTypeEnumToCleaningHistoryTable1677152571063
  implements MigrationInterface
{
  name = 'addCleaningTypeEnumToCleaningHistoryTable1677152571063';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_a0458c04a096e72617aa745599\` ON \`cleaning_history\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cleaning_history\` ADD \`cleaning_type\` enum ('dry', 'wet') NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cleaning_history\` DROP COLUMN \`cleaning_type\``,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_a0458c04a096e72617aa745599\` ON \`cleaning_history\` (\`swab_area_history_id\`)`,
    );
  }
}
