import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeDependsOnShiftFieldFromSwabPeriodTable1668188189434
  implements MigrationInterface
{
  name = 'removeDependsOnShiftFieldFromSwabPeriodTable1668188189434';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_period\` DROP COLUMN \`depends_on_shift\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_period\` ADD \`depends_on_shift\` tinyint NOT NULL`,
    );
  }
}
