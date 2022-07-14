import { MigrationInterface, QueryRunner } from "typeorm";

export class createSwabAreaTable1657822232863 implements MigrationInterface {
    name = 'createSwabAreaTable1657822232863'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`swab_area\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`swab_area_name\` varchar(255) NOT NULL, \`main_swab_area_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD \`swab_area_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area\` ADD CONSTRAINT \`FK_270858837c35d07c113f0702ac3\` FOREIGN KEY (\`main_swab_area_id\`) REFERENCES \`swab_area\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD CONSTRAINT \`FK_70d0a5e03297084e399a5544579\` FOREIGN KEY (\`swab_area_id\`) REFERENCES \`swab_area\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP FOREIGN KEY \`FK_70d0a5e03297084e399a5544579\``);
        await queryRunner.query(`ALTER TABLE \`swab_area\` DROP FOREIGN KEY \`FK_270858837c35d07c113f0702ac3\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP COLUMN \`swab_area_id\``);
        await queryRunner.query(`DROP TABLE \`swab_area\``);
    }

}
