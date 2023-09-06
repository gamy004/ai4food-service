import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSwabRoundTable1659810397206 implements MigrationInterface {
  name = 'addSwabRoundTable1659810397206';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`swab_round\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`swab_round_number\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` ADD \`swab_round_id\` bigint NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` ADD CONSTRAINT \`FK_36762bd26b4093adb0d6124271d\` FOREIGN KEY (\`swab_round_id\`) REFERENCES \`swab_round\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` DROP FOREIGN KEY \`FK_36762bd26b4093adb0d6124271d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` DROP COLUMN \`swab_round_id\``,
    );
    await queryRunner.query(`DROP TABLE \`swab_round\``);
  }
}
