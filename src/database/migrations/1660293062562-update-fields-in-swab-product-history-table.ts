import { MigrationInterface, QueryRunner } from "typeorm";

export class updateFieldsInSwabProductHistoryTable1660293062562 implements MigrationInterface {
    name = 'updateFieldsInSwabProductHistoryTable1660293062562'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` DROP COLUMN \`swab_product_lot\``);
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` ADD \`product_lot\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` ADD \`swab_product_note\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` DROP COLUMN \`swab_product_note\``);
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` DROP COLUMN \`product_lot\``);
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` ADD \`swab_product_lot\` varchar(255) NOT NULL`);
    }

}
