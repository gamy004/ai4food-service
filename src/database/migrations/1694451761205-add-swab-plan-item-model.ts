import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSwabPlanItemModel1694451761205 implements MigrationInterface {
  name = 'addSwabPlanItemModel1694451761205';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`swab_plan_item\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`order\` int NOT NULL DEFAULT '0', \`swab_area_id\` varchar(36) NOT NULL, \`swab_plan_id\` varchar(36) NOT NULL, \`facility_item_id\` varchar(36) NOT NULL, \`swab_area_history_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_plan_item\` ADD CONSTRAINT \`FK_b16f4b8fb816f653449066c6fe5\` FOREIGN KEY (\`swab_area_id\`) REFERENCES \`swab_area\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_plan_item\` ADD CONSTRAINT \`FK_fe85009de8aa9cf68a723cb59cb\` FOREIGN KEY (\`swab_plan_id\`) REFERENCES \`swab_plan\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_plan_item\` ADD CONSTRAINT \`FK_e94646ea319aecf37f298f974d0\` FOREIGN KEY (\`facility_item_id\`) REFERENCES \`facility_item\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_plan_item\` ADD CONSTRAINT \`FK_4cf39a405510e0df5ea4d26ee65\` FOREIGN KEY (\`swab_area_history_id\`) REFERENCES \`swab_area_history\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_plan_item\` DROP FOREIGN KEY \`FK_4cf39a405510e0df5ea4d26ee65\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_plan_item\` DROP FOREIGN KEY \`FK_e94646ea319aecf37f298f974d0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_plan_item\` DROP FOREIGN KEY \`FK_fe85009de8aa9cf68a723cb59cb\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_plan_item\` DROP FOREIGN KEY \`FK_b16f4b8fb816f653449066c6fe5\``,
    );
    await queryRunner.query(`DROP TABLE \`swab_plan_item\``);
  }
}
