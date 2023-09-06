import { MigrationInterface, QueryRunner } from 'typeorm';

export class createSensorMappingTable1669739827841
  implements MigrationInterface
{
  name = 'createSensorMappingTable1669739827841';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`sensor_mapping\` (\`node_no\` varchar(20) NOT NULL, \`started_at\` datetime NOT NULL, \`ended_at\` datetime NOT NULL, \`facility_item_id\` varchar(36) NULL, PRIMARY KEY (\`node_no\`, \`started_at\`, \`ended_at\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_mapping\` ADD CONSTRAINT \`FK_c7cf47961b80c1cce60fda61ad8\` FOREIGN KEY (\`facility_item_id\`) REFERENCES \`facility_item\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`sensor_mapping\` DROP FOREIGN KEY \`FK_c7cf47961b80c1cce60fda61ad8\``,
    );
    await queryRunner.query(`DROP TABLE \`sensor_mapping\``);
  }
}
