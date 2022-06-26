import { MigrationInterface, QueryRunner } from "typeorm";

export class addFkUserImportTransaction1656253573278 implements MigrationInterface {
    name = 'addFkUserImportTransaction1656253573278'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`import_transaction\` ADD \`imported_user_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`import_transaction\` ADD CONSTRAINT \`FK_1a924b0c79dbc36791da271c4bf\` FOREIGN KEY (\`imported_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`import_transaction\` DROP FOREIGN KEY \`FK_1a924b0c79dbc36791da271c4bf\``);
        await queryRunner.query(`ALTER TABLE \`import_transaction\` DROP COLUMN \`imported_user_id\``);
    }

}
