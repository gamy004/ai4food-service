import { MigrationInterface, QueryRunner } from "typeorm";

export class addFieldProductDateToSwabProductHistoryTable1660293723390 implements MigrationInterface {
    name = 'addFieldProductDateToSwabProductHistoryTable1660293723390'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` ADD \`product_date\` date NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` DROP COLUMN \`product_date\``);
    }

}
