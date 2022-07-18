import { MigrationInterface, QueryRunner } from "typeorm";

export class addNullableToSwabAreaTemperatureHumidityAtpField1658154960955 implements MigrationInterface {
    name = 'addNullableToSwabAreaTemperatureHumidityAtpField1658154960955'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` CHANGE \`swab_area_temperature\` \`swab_area_temperature\` decimal(2) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` CHANGE \`swab_area_humidity\` \`swab_area_humidity\` decimal(2) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` CHANGE \`swab_area_atp\` \`swab_area_atp\` int NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` CHANGE \`swab_area_atp\` \`swab_area_atp\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` CHANGE \`swab_area_humidity\` \`swab_area_humidity\` decimal(2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` CHANGE \`swab_area_temperature\` \`swab_area_temperature\` decimal(2) NOT NULL`);
    }

}
