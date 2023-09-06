import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFieldBoxTempAndBoxHumidFieldToSensorDataTable1664449218128
  implements MigrationInterface
{
  name = 'addFieldBoxTempAndBoxHumidFieldToSensorDataTable1664449218128';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` ADD \`box_temperature\` float NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` ADD \`box_humidity\` float NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` DROP COLUMN \`box_humidity\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_data\` DROP COLUMN \`box_temperature\``,
    );
  }
}
