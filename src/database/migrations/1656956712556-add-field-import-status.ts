import { MigrationInterface, QueryRunner } from "typeorm";

export class addFieldImportStatus1656956712556 implements MigrationInterface {
    name = 'addFieldImportStatus1656956712556'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`import_transaction\` ADD \`import_status\` enum ('pending', 'success', 'cancel') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`import_transaction\` DROP COLUMN \`import_status\``);
    }

}
