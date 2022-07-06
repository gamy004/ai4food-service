import { MigrationInterface, QueryRunner } from "typeorm";

export class removeFieldTransactionNo1656951590776 implements MigrationInterface {
    name = 'removeFieldTransactionNo1656951590776'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`import_transaction\` DROP COLUMN \`transaction_number\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`import_transaction\` ADD \`transaction_number\` varchar(255) NOT NULL`);
    }

}
