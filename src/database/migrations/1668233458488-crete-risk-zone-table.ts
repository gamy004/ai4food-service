import { MigrationInterface, QueryRunner } from 'typeorm';

export class creteRiskZoneTable1668233458488 implements MigrationInterface {
  name = 'creteRiskZoneTable1668233458488';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`risk_zone\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`risk_zone_name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_79f2150f1d2449ed0045904a65\` (\`risk_zone_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`room\` ADD \`risk_zone_id\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`facility_item\` ADD \`risk_zone_id\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`room\` ADD CONSTRAINT \`FK_2c471ce531b21395caaf5cc7e49\` FOREIGN KEY (\`risk_zone_id\`) REFERENCES \`risk_zone\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`facility_item\` ADD CONSTRAINT \`FK_f02fd19a4d653175539c726c0d4\` FOREIGN KEY (\`risk_zone_id\`) REFERENCES \`risk_zone\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`facility_item\` DROP FOREIGN KEY \`FK_f02fd19a4d653175539c726c0d4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`room\` DROP FOREIGN KEY \`FK_2c471ce531b21395caaf5cc7e49\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`facility_item\` DROP COLUMN \`risk_zone_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`room\` DROP COLUMN \`risk_zone_id\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_79f2150f1d2449ed0045904a65\` ON \`risk_zone\``,
    );
    await queryRunner.query(`DROP TABLE \`risk_zone\``);
  }
}
