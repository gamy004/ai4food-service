import { MigrationInterface, QueryRunner } from "typeorm";

export class addNullableToProductLotAndAddProductDateToSwabAreaHistory1658838319184 implements MigrationInterface {
    name = 'addNullableToProductLotAndAddProductDateToSwabAreaHistory1658838319184'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD \`product_date\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` CHANGE \`product_lot\` \`product_lot\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` CHANGE \`product_lot\` \`product_lot\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP COLUMN \`product_date\``);
    }

}
