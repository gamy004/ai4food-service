import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFileRelationToImportTransactionTable1678596693691
  implements MigrationInterface
{
  name = 'addFileRelationToImportTransactionTable1678596693691';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`import_transaction\` ADD \`imported_file_id\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`import_transaction\` ADD UNIQUE INDEX \`IDX_c824e6c68fbec3e84f14d97d92\` (\`imported_file_id\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_c824e6c68fbec3e84f14d97d92\` ON \`import_transaction\` (\`imported_file_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`import_transaction\` ADD CONSTRAINT \`FK_c824e6c68fbec3e84f14d97d927\` FOREIGN KEY (\`imported_file_id\`) REFERENCES \`file\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`import_transaction\` DROP FOREIGN KEY \`FK_c824e6c68fbec3e84f14d97d927\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_c824e6c68fbec3e84f14d97d92\` ON \`import_transaction\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`import_transaction\` DROP INDEX \`IDX_c824e6c68fbec3e84f14d97d92\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`import_transaction\` DROP COLUMN \`imported_file_id\``,
    );
  }
}
