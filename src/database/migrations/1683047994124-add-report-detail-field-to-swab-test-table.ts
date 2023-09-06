import { MigrationInterface, QueryRunner } from 'typeorm';

export class addReportDetailFieldToSwabTestTable1683047994124
  implements MigrationInterface
{
  name = 'addReportDetailFieldToSwabTestTable1683047994124';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_test\` ADD \`report_detail\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_test\` DROP COLUMN \`report_detail\``,
    );
  }
}
