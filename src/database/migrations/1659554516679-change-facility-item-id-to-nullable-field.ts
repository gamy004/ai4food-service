import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeFacilityItemIdToNullableField1659554516679
  implements MigrationInterface
{
  name = 'changeFacilityItemIdToNullableField1659554516679';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` DROP FOREIGN KEY \`FK_fedab6504b63b565d41359b24e8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` CHANGE \`facility_item_id\` \`facility_item_id\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` ADD CONSTRAINT \`FK_fedab6504b63b565d41359b24e8\` FOREIGN KEY (\`facility_item_id\`) REFERENCES \`facility_item\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` DROP FOREIGN KEY \`FK_fedab6504b63b565d41359b24e8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` CHANGE \`facility_item_id\` \`facility_item_id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` ADD CONSTRAINT \`FK_fedab6504b63b565d41359b24e8\` FOREIGN KEY (\`facility_item_id\`) REFERENCES \`facility_item\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
