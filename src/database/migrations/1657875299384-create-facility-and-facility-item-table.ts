import { MigrationInterface, QueryRunner } from "typeorm";

export class createFacilityAndFacilityItemTable1657875299384 implements MigrationInterface {
    name = 'createFacilityAndFacilityItemTable1657875299384'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`facility\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`facility_name\` varchar(255) NOT NULL, \`facility_type\` enum ('machine', 'vehical', 'tool') NOT NULL, UNIQUE INDEX \`IDX_4f1ace4712ad4c9d1faa18ece3\` (\`facility_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`facility_item\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`facility_item_name\` varchar(255) NOT NULL, \`facility_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_f4a3c4968f0e01a1b1ad76542b\` (\`facility_item_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`facility_item\` ADD CONSTRAINT \`FK_b0b22a288366ab2798d61469f9b\` FOREIGN KEY (\`facility_id\`) REFERENCES \`facility\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`facility_item\` DROP FOREIGN KEY \`FK_b0b22a288366ab2798d61469f9b\``);
        await queryRunner.query(`DROP INDEX \`IDX_f4a3c4968f0e01a1b1ad76542b\` ON \`facility_item\``);
        await queryRunner.query(`DROP TABLE \`facility_item\``);
        await queryRunner.query(`DROP INDEX \`IDX_4f1ace4712ad4c9d1faa18ece3\` ON \`facility\``);
        await queryRunner.query(`DROP TABLE \`facility\``);
    }

}
