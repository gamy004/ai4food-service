import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSwabPlanModel1694019914408 implements MigrationInterface {
  name = 'addSwabPlanModel1694019914408';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`swab_plan\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`shift\` enum ('day', 'night') NOT NULL, \`swab_plan_date\` date NOT NULL, \`swab_plan_note\` text NULL, \`swab_plan_code\` varchar(10) NULL, \`swab_period_id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_plan\` ADD CONSTRAINT \`FK_d5e24b573bf43103093ed1a52b2\` FOREIGN KEY (\`swab_period_id\`) REFERENCES \`swab_period\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_plan\` DROP FOREIGN KEY \`FK_d5e24b573bf43103093ed1a52b2\``,
    );
    await queryRunner.query(`DROP TABLE \`swab_plan\``);
  }
}
