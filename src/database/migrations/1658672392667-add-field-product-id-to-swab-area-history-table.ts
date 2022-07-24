import { MigrationInterface, QueryRunner } from "typeorm";

export class addFieldProductIdToSwabAreaHistoryTable1658672392667 implements MigrationInterface {
    name = 'addFieldProductIdToSwabAreaHistoryTable1658672392667'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD \`product_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD \`product_lot\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD CONSTRAINT \`FK_91abbb1db891e6899999f11fd32\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP FOREIGN KEY \`FK_91abbb1db891e6899999f11fd32\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP COLUMN \`product_lot\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP COLUMN \`product_id\``);
    }

}
