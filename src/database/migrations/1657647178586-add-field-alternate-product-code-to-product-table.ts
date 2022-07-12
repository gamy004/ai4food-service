import { MigrationInterface, QueryRunner } from "typeorm";

export class addFieldAlternateProductCodeToProductTable1657647178586 implements MigrationInterface {
    name = 'addFieldAlternateProductCodeToProductTable1657647178586'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product\` ADD \`alternate_product_code\` varchar(8) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD UNIQUE INDEX \`IDX_3d4628fd27bebc45bb276c3ae3\` (\`alternate_product_code\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product\` DROP INDEX \`IDX_3d4628fd27bebc45bb276c3ae3\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP COLUMN \`alternate_product_code\``);
    }

}
