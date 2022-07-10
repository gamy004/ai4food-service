import { MigrationInterface, QueryRunner } from "typeorm";

export class addNullableToImportedFileUrlAndImportedFileName1657295891537 implements MigrationInterface {
    name = 'addNullableToImportedFileUrlAndImportedFileName1657295891537'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`import_transaction\` ADD \`imported_file_url\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`import_transaction\` ADD \`imported_file_name\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`import_transaction\` DROP COLUMN \`imported_file_name\``);
        await queryRunner.query(`ALTER TABLE \`import_transaction\` DROP COLUMN \`imported_file_url\``);
    }

}
