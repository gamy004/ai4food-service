import { MigrationInterface, QueryRunner } from "typeorm";

export class updateDecimalFieldInSwabAreaHistoryTable1658423008513 implements MigrationInterface {
    name = 'updateDecimalFieldInSwabAreaHistoryTable1658423008513'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` CHANGE \`swab_area_temperature\` \`swab_area_temperature\` decimal(3,1) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` CHANGE \`swab_area_humidity\` \`swab_area_humidity\` decimal(3,1) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` CHANGE \`swab_area_humidity\` \`swab_area_humidity\` decimal(2,0) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` CHANGE \`swab_area_temperature\` \`swab_area_temperature\` decimal(2,0) NULL`);
    }

}
