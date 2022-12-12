import { MigrationInterface, QueryRunner } from "typeorm";

export class addSwabTestOrderFieldToSwabTestTable1670141778317 implements MigrationInterface {
    name = 'addSwabTestOrderFieldToSwabTestTable1670141778317'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD \`swab_test_order\` int NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP COLUMN \`swab_test_order\``);
    }

}
