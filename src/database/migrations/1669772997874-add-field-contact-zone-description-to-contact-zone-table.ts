import { MigrationInterface, QueryRunner } from "typeorm";

export class addFieldContactZoneDescriptionToContactZoneTable1669772997874 implements MigrationInterface {
    name = 'addFieldContactZoneDescriptionToContactZoneTable1669772997874'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`contact_zone\` ADD \`contact_zone_description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`room\` ADD \`risk_zone_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`facility_item\` ADD \`risk_zone_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`room\` ADD CONSTRAINT \`FK_2c471ce531b21395caaf5cc7e49\` FOREIGN KEY (\`risk_zone_id\`) REFERENCES \`risk_zone\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`facility_item\` ADD CONSTRAINT \`FK_f02fd19a4d653175539c726c0d4\` FOREIGN KEY (\`risk_zone_id\`) REFERENCES \`risk_zone\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`facility_item\` DROP FOREIGN KEY \`FK_f02fd19a4d653175539c726c0d4\``);
        await queryRunner.query(`ALTER TABLE \`room\` DROP FOREIGN KEY \`FK_2c471ce531b21395caaf5cc7e49\``);
        await queryRunner.query(`ALTER TABLE \`facility_item\` DROP COLUMN \`risk_zone_id\``);
        await queryRunner.query(`ALTER TABLE \`room\` DROP COLUMN \`risk_zone_id\``);
        await queryRunner.query(`ALTER TABLE \`contact_zone\` DROP COLUMN \`contact_zone_description\``);
    }

}
