import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAdditionalParamsToSwabPlanModel1694021367965
  implements MigrationInterface
{
  name = 'addAdditionalParamsToSwabPlanModel1694021367965';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_plan\` ADD \`total_items\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_plan\` ADD \`publish\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_plan\` DROP COLUMN \`publish\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_plan\` DROP COLUMN \`total_items\``,
    );
  }
}
