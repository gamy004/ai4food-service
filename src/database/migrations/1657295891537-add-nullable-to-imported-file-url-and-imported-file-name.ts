import { MigrationInterface, QueryRunner } from "typeorm";

export class addNullableToImportedFileUrlAndImportedFileName1657295891537 implements MigrationInterface {
    name = 'addNullableToImportedFileUrlAndImportedFileName1657295891537'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`import_transaction\` CHANGE \`imported_file_url\` \`imported_file_url\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`import_transaction\` CHANGE \`imported_file_name\` \`imported_file_name\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`import_transaction\` CHANGE \`imported_file_name\` \`imported_file_name\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`import_transaction\` CHANGE \`imported_file_url\` \`imported_file_url\` text NOT NULL`);
    }

}
