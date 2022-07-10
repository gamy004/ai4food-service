import { MigrationInterface, QueryRunner } from "typeorm";

export class addFieldsToImportTransactionTable1657125427889 implements MigrationInterface {
    name = 'addFieldsToImportTransactionTable1657125427889'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`import_transaction\` ADD \`import_source\` enum ('web', 'operator') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`import_transaction\` DROP COLUMN \`import_source\``);
    }

}
