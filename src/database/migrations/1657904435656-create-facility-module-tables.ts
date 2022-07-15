import { MigrationInterface, QueryRunner } from "typeorm";

export class createFacilityModuleTables1657904435656 implements MigrationInterface {
    name = 'createFacilityModuleTables1657904435656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`facility_item\` DROP FOREIGN KEY \`FK_b0b22a288366ab2798d61469f9b\``);
        await queryRunner.query(`CREATE TABLE \`zone\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`zone_name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_7a30dbf9d42907460e25ad5c29\` (\`zone_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`room\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`room_name\` varchar(255) NOT NULL, \`zone_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_ecffbe9c186305d63c6284bfef\` (\`room_name\`, \`zone_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`facility_item\` ADD \`room_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`facility_item\` ADD \`zone_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`room\` ADD CONSTRAINT \`FK_ccb953914396483e92f688419dc\` FOREIGN KEY (\`zone_id\`) REFERENCES \`zone\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`facility_item\` ADD CONSTRAINT \`FK_b0b22a288366ab2798d61469f9b\` FOREIGN KEY (\`facility_id\`) REFERENCES \`facility\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`facility_item\` ADD CONSTRAINT \`FK_e68f39effba6ce59c6ec7420545\` FOREIGN KEY (\`room_id\`) REFERENCES \`room\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`facility_item\` ADD CONSTRAINT \`FK_211ddb6da17b9b8c5a1c67b8b19\` FOREIGN KEY (\`zone_id\`) REFERENCES \`zone\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`facility_item\` DROP FOREIGN KEY \`FK_211ddb6da17b9b8c5a1c67b8b19\``);
        await queryRunner.query(`ALTER TABLE \`facility_item\` DROP FOREIGN KEY \`FK_e68f39effba6ce59c6ec7420545\``);
        await queryRunner.query(`ALTER TABLE \`facility_item\` DROP FOREIGN KEY \`FK_b0b22a288366ab2798d61469f9b\``);
        await queryRunner.query(`ALTER TABLE \`room\` DROP FOREIGN KEY \`FK_ccb953914396483e92f688419dc\``);
        await queryRunner.query(`ALTER TABLE \`facility_item\` DROP COLUMN \`zone_id\``);
        await queryRunner.query(`ALTER TABLE \`facility_item\` DROP COLUMN \`room_id\``);
        await queryRunner.query(`DROP INDEX \`IDX_ecffbe9c186305d63c6284bfef\` ON \`room\``);
        await queryRunner.query(`DROP TABLE \`room\``);
        await queryRunner.query(`DROP INDEX \`IDX_7a30dbf9d42907460e25ad5c29\` ON \`zone\``);
        await queryRunner.query(`DROP TABLE \`zone\``);
        await queryRunner.query(`ALTER TABLE \`facility_item\` ADD CONSTRAINT \`FK_b0b22a288366ab2798d61469f9b\` FOREIGN KEY (\`facility_id\`) REFERENCES \`facility\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
