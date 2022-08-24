import { MigrationInterface, QueryRunner } from "typeorm";

export class addSensorDataTable1661348965387 implements MigrationInterface {
    name = 'addSensorDataTable1661348965387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`sensor_data\` (\`node_no\` varchar(20) NOT NULL, \`time_send\` datetime NOT NULL, \`temperature\` float NULL, \`humidity\` float NULL, \`vibration\` float NULL, \`pixel_rows_1_2\` varchar(200) NULL, \`pixel_rows_3_4\` varchar(200) NULL, \`pixel_rows_5_6\` varchar(200) NULL, \`pixel_rows_7_8\` varchar(200) NULL, \`pixel_rows_9_10\` varchar(200) NULL, \`pixel_rows_11_12\` varchar(200) NULL, \`pixel_rows_13_14\` varchar(200) NULL, \`pixel_rows_15_16\` varchar(200) NULL, \`pixel_rows_17_18\` varchar(200) NULL, \`pixel_rows_19_20\` varchar(200) NULL, \`pixel_rows_21_22\` varchar(200) NULL, \`pixel_rows_23_24\` varchar(200) NULL, \`timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`node_no\`, \`time_send\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`sensor_data\``);
    }

}
