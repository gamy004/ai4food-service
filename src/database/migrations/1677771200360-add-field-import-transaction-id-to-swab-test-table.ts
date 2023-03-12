import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFieldImportTransactionIdToSwabTestTable1677771200360
  implements MigrationInterface
{
  name = 'addFieldImportTransactionIdToSwabTestTable1677771200360';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_test\` ADD \`import_transaction_id\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`import_transaction\` CHANGE \`import_type\` \`import_type\` enum ('product_schedule', 'cleaning_plan', 'cleaning_room_history', 'swab_test') NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_test\` ADD CONSTRAINT \`FK_560658cee84c25bea0ca556ff11\` FOREIGN KEY (\`import_transaction_id\`) REFERENCES \`import_transaction\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_test\` DROP FOREIGN KEY \`FK_560658cee84c25bea0ca556ff11\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`import_transaction\` CHANGE \`import_type\` \`import_type\` enum ('product_schedule', 'cleaning_plan', 'cleaning_room_history') NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_test\` DROP COLUMN \`import_transaction_id\``,
    );
  }
}
