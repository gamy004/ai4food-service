import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeFieldsInSwabProductHistoryToNullable1661879334247
  implements MigrationInterface
{
  name = 'changeFieldsInSwabProductHistoryToNullable1661879334247';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` DROP FOREIGN KEY \`FK_4273c86846386a862c60a1b08c6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` DROP FOREIGN KEY \`FK_c62ce25cf55e6a376ee270b1018\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` CHANGE \`product_id\` \`product_id\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` CHANGE \`product_lot\` \`product_lot\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` CHANGE \`swab_product_date\` \`swab_product_date\` date NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` CHANGE \`swab_test_id\` \`swab_test_id\` bigint NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` ADD CONSTRAINT \`FK_4273c86846386a862c60a1b08c6\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` ADD CONSTRAINT \`FK_c62ce25cf55e6a376ee270b1018\` FOREIGN KEY (\`swab_test_id\`) REFERENCES \`swab_test\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` DROP FOREIGN KEY \`FK_c62ce25cf55e6a376ee270b1018\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` DROP FOREIGN KEY \`FK_4273c86846386a862c60a1b08c6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` CHANGE \`swab_test_id\` \`swab_test_id\` bigint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` CHANGE \`swab_product_date\` \`swab_product_date\` date NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` CHANGE \`product_lot\` \`product_lot\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` CHANGE \`product_id\` \`product_id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` ADD CONSTRAINT \`FK_c62ce25cf55e6a376ee270b1018\` FOREIGN KEY (\`swab_test_id\`) REFERENCES \`swab_test\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_product_history\` ADD CONSTRAINT \`FK_4273c86846386a862c60a1b08c6\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
