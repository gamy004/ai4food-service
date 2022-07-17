import { MigrationInterface, QueryRunner } from "typeorm";

export class addColumnMainSwabAreaIdInSwabAreaTable1658001006488 implements MigrationInterface {
    name = 'addColumnMainSwabAreaIdInSwabAreaTable1658001006488'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE \`swab_area\` DROP FOREIGN KEY \`FK_270858837c35d07c113f0702ac3\``);
        // await queryRunner.query(`ALTER TABLE \`swab_area\` DROP COLUMN \`main_swab_area_id\``);
        // await queryRunner.query(`ALTER TABLE \`swab_area\` ADD \`main_swab_area_id\` varchar(255) NULL`);
        // await queryRunner.query(`ALTER TABLE \`swab_area\` ADD CONSTRAINT \`FK_270858837c35d07c113f0702ac3\` FOREIGN KEY (\`main_swab_area_id\`) REFERENCES \`swab_area\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE \`swab_area\` DROP FOREIGN KEY \`FK_270858837c35d07c113f0702ac3\``);
        // await queryRunner.query(`ALTER TABLE \`swab_area\` DROP COLUMN \`main_swab_area_id\``);
        // await queryRunner.query(`ALTER TABLE \`swab_area\` ADD \`main_swab_area_id\` varchar(36) NULL`);
        // await queryRunner.query(`ALTER TABLE \`swab_area\` ADD CONSTRAINT \`FK_270858837c35d07c113f0702ac3\` FOREIGN KEY (\`main_swab_area_id\`) REFERENCES \`swab_area\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
