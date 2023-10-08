import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFieldSwabPeriodOrderToSwabPeriodTable1696797189693
  implements MigrationInterface
{
  name = 'addFieldSwabPeriodOrderToSwabPeriodTable1696797189693';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_period\` ADD \`swab_period_order\` int NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_period\` DROP COLUMN \`swab_period_order\``,
    );
  }
}
