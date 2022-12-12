import { MigrationInterface, QueryRunner } from "typeorm";

export class createContactZoneTableAndCleaningRelatedTables1669749658778 implements MigrationInterface {
    name = 'createContactZoneTableAndCleaningRelatedTables1669749658778'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`contact_zone\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`contact_zone_name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_102218bf317e46bf80b7eef064\` (\`contact_zone_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cleaning_room_history\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`cleaning_room_date\` date NOT NULL, \`cleaning_room_started_at\` time NOT NULL, \`cleaning_room_started_at_timestamp\` timestamp NOT NULL, \`cleaning_room_ended_at\` time NOT NULL, \`cleaning_room_ended_at_timestamp\` timestamp NOT NULL, \`room_id\` varchar(36) NOT NULL, \`risk_zone_id\` varchar(36) NULL, \`import_transaction_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cleaning_program\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`cleaning_program_name\` varchar(255) NOT NULL, \`cleaning_program_description\` text NULL, UNIQUE INDEX \`IDX_c229ce9dd87c76bcc9c4e4457e\` (\`cleaning_program_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cleaning_plan\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`cleaning_plan_name\` varchar(255) NOT NULL, \`cleaning_plan_date\` date NOT NULL, \`cleaning_program_id\` varchar(36) NOT NULL, \`facility_item_id\` varchar(36) NOT NULL, \`import_transaction_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_c175bda46abe6022a1880a037a\` (\`cleaning_plan_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`swab_area\` ADD \`contact_zone_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area\` ADD CONSTRAINT \`FK_ffb86cc054956b432c19ae35b1c\` FOREIGN KEY (\`contact_zone_id\`) REFERENCES \`contact_zone\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cleaning_room_history\` ADD CONSTRAINT \`FK_fae69e697f1a6b9f4d640904e8e\` FOREIGN KEY (\`room_id\`) REFERENCES \`room\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cleaning_room_history\` ADD CONSTRAINT \`FK_46ba4188ec59a0367f242fe1fde\` FOREIGN KEY (\`risk_zone_id\`) REFERENCES \`risk_zone\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cleaning_room_history\` ADD CONSTRAINT \`FK_d19621dabe2c77256d2651aa28c\` FOREIGN KEY (\`import_transaction_id\`) REFERENCES \`import_transaction\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cleaning_plan\` ADD CONSTRAINT \`FK_0e86497effe07f1172a2a408203\` FOREIGN KEY (\`cleaning_program_id\`) REFERENCES \`cleaning_program\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cleaning_plan\` ADD CONSTRAINT \`FK_4e4886849a56cac0e13bad43143\` FOREIGN KEY (\`facility_item_id\`) REFERENCES \`facility_item\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cleaning_plan\` ADD CONSTRAINT \`FK_10c082e109ab30f5a9517007ef6\` FOREIGN KEY (\`import_transaction_id\`) REFERENCES \`import_transaction\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cleaning_plan\` DROP FOREIGN KEY \`FK_10c082e109ab30f5a9517007ef6\``);
        await queryRunner.query(`ALTER TABLE \`cleaning_plan\` DROP FOREIGN KEY \`FK_4e4886849a56cac0e13bad43143\``);
        await queryRunner.query(`ALTER TABLE \`cleaning_plan\` DROP FOREIGN KEY \`FK_0e86497effe07f1172a2a408203\``);
        await queryRunner.query(`ALTER TABLE \`cleaning_room_history\` DROP FOREIGN KEY \`FK_d19621dabe2c77256d2651aa28c\``);
        await queryRunner.query(`ALTER TABLE \`cleaning_room_history\` DROP FOREIGN KEY \`FK_46ba4188ec59a0367f242fe1fde\``);
        await queryRunner.query(`ALTER TABLE \`cleaning_room_history\` DROP FOREIGN KEY \`FK_fae69e697f1a6b9f4d640904e8e\``);
        await queryRunner.query(`ALTER TABLE \`swab_area\` DROP FOREIGN KEY \`FK_ffb86cc054956b432c19ae35b1c\``);
        await queryRunner.query(`ALTER TABLE \`swab_area\` DROP COLUMN \`contact_zone_id\``);
        await queryRunner.query(`DROP INDEX \`IDX_c175bda46abe6022a1880a037a\` ON \`cleaning_plan\``);
        await queryRunner.query(`DROP TABLE \`cleaning_plan\``);
        await queryRunner.query(`DROP INDEX \`IDX_c229ce9dd87c76bcc9c4e4457e\` ON \`cleaning_program\``);
        await queryRunner.query(`DROP TABLE \`cleaning_program\``);
        await queryRunner.query(`DROP TABLE \`cleaning_room_history\``);
        await queryRunner.query(`DROP INDEX \`IDX_102218bf317e46bf80b7eef064\` ON \`contact_zone\``);
        await queryRunner.query(`DROP TABLE \`contact_zone\``);
    }

}
