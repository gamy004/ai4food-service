import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFieldContactZoneDescriptionToContactZoneTable1669772997874
  implements MigrationInterface
{
  name = 'addFieldContactZoneDescriptionToContactZoneTable1669772997874';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`contact_zone\` ADD \`contact_zone_description\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`contact_zone\` DROP COLUMN \`contact_zone_description\``,
    );
  }
}
