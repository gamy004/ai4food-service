import { MigrationInterface, QueryRunner } from 'typeorm';

export class addRelationToSwabProductHistory1660144099934
  implements MigrationInterface
{
  name = 'addRelationToSwabProductHistory1660144099934';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` ADD \`swab_period_id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` ADD \`facility_item_id\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` ADD CONSTRAINT \`FK_d68e7e8daa07851795152bb22aa\` FOREIGN KEY (\`swab_period_id\`) REFERENCES \`swab_period\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` ADD CONSTRAINT \`FK_ed22089f7f0a250790527078577\` FOREIGN KEY (\`facility_item_id\`) REFERENCES \`facility_item\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` DROP FOREIGN KEY \`FK_ed22089f7f0a250790527078577\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` DROP FOREIGN KEY \`FK_d68e7e8daa07851795152bb22aa\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` DROP COLUMN \`facility_item_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` DROP COLUMN \`swab_period_id\``,
    );
  }
}
