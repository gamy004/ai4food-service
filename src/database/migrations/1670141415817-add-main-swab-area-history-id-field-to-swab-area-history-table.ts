import { MigrationInterface, QueryRunner } from 'typeorm';

export class addMainSwabAreaHistoryIdFieldToSwabAreaHistoryTable1670141415817
  implements MigrationInterface
{
  name = 'addMainSwabAreaHistoryIdFieldToSwabAreaHistoryTable1670141415817';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` ADD \`main_swab_area_history_id\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` ADD CONSTRAINT \`FK_35a9b52080cf358ce4b08eef437\` FOREIGN KEY (\`main_swab_area_history_id\`) REFERENCES \`swab_area_history\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` DROP FOREIGN KEY \`FK_35a9b52080cf358ce4b08eef437\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` DROP COLUMN \`main_swab_area_history_id\``,
    );
  }
}
