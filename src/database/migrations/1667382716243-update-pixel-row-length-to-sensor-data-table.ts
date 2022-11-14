import { MigrationInterface, QueryRunner } from 'typeorm';

export class updatePixelRowLengthToSensorDataTable1667382716243
  implements MigrationInterface
{
  name = 'updatePixelRowLengthToSensorDataTable1667382716243';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_1_2\` varchar(400)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_3_4\` varchar(400)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_5_6\` varchar(400)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_7_8\` varchar(400)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_9_10\` varchar(400)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_11_12\` varchar(400)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_13_14\` varchar(400)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_15_16\` varchar(400)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_17_18\` varchar(400)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_19_20\` varchar(400)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_21_22\` varchar(400)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_23_24\` varchar(400)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_23_24\` varchar(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_21_22\` varchar(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_19_20\` varchar(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_17_18\` varchar(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_15_16\` varchar(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_13_14\` varchar(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_11_12\` varchar(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_9_10\` varchar(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_7_8\` varchar(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_5_6\` varchar(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_3_4\` varchar(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` MODIFY \`pixel_rows_1_2\` varchar(200)`,
    );
  }
}
