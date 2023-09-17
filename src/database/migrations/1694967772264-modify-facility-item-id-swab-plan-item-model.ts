import { MigrationInterface, QueryRunner } from 'typeorm';

export class modifyFacilityItemIdSwabPlanItemModel1694967772264
  implements MigrationInterface
{
  name = 'modifyFacilityItemIdSwabPlanItemModel1694967772264';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_plan_item\` DROP FOREIGN KEY \`FK_e94646ea319aecf37f298f974d0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_plan_item\` CHANGE \`facility_item_id\` \`facility_item_id\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_plan_item\` ADD CONSTRAINT \`FK_e94646ea319aecf37f298f974d0\` FOREIGN KEY (\`facility_item_id\`) REFERENCES \`facility_item\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_plan_item\` DROP FOREIGN KEY \`FK_e94646ea319aecf37f298f974d0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_plan_item\` CHANGE \`facility_item_id\` \`facility_item_id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_plan_item\` ADD CONSTRAINT \`FK_e94646ea319aecf37f298f974d0\` FOREIGN KEY (\`facility_item_id\`) REFERENCES \`facility_item\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
