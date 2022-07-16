import { MigrationInterface, QueryRunner } from "typeorm";

export class addSwabPeriodTableAndFkToSwabAreaHistoryTable1657986000468 implements MigrationInterface {
    name = 'addSwabPeriodTableAndFkToSwabAreaHistoryTable1657986000468'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD \`swab_period_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD CONSTRAINT \`FK_864165df74f622596e14f598bf2\` FOREIGN KEY (\`swab_period_id\`) REFERENCES \`swab_period\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP FOREIGN KEY \`FK_864165df74f622596e14f598bf2\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP COLUMN \`swab_period_id\``);
    }

}
