import { MigrationInterface, QueryRunner } from "typeorm";

export class addFieldsToImportTransactionTable1657125427889 implements MigrationInterface {
    name = 'addFieldsToImportTransactionTable1657125427889'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`import_transaction\` CHANGE \`import_source\` \`import_source\` enum ('web', 'operator') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`import_transaction\` CHANGE \`import_source\` \`import_source\` enum ('production_schedule', 'cleaning_plan', 'cleaning_room_history') NOT NULL`);
    }

}
