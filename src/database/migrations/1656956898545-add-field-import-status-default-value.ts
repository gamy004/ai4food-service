import { MigrationInterface, QueryRunner } from "typeorm";

export class addFieldImportStatusDefaultValue1656956898545 implements MigrationInterface {
    name = 'addFieldImportStatus21656956898545'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`import_transaction\` CHANGE \`import_status\` \`import_status\` enum ('pending', 'success', 'cancel') NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`import_transaction\` CHANGE \`import_status\` \`import_status\` enum ('pending', 'success', 'cancel') NOT NULL`);
    }

}
