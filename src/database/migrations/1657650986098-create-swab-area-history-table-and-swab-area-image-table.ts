import { MigrationInterface, QueryRunner } from "typeorm";

export class createSwabAreaHistoryTableAndSwabAreaImageTable1657650986098 implements MigrationInterface {
    name = 'createSwabAreaHistoryTableAndSwabAreaImageTable1657650986098'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`swab_area_history\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`swab_area_swabed_at\` time NOT NULL, \`swab_area_temperature\` decimal(2) NOT NULL, \`swab_area_humidity_percent\` decimal(2) NOT NULL, \`swab_area_atp_value\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`swab_area_image\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`swab_area_image_url\` text NOT NULL, \`swab_area_image_description\` text NULL, \`swab_area_history_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`swab_area_image\` ADD CONSTRAINT \`FK_5a422fea5e5a5a14291691cea05\` FOREIGN KEY (\`swab_area_history_id\`) REFERENCES \`swab_area_history\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_image\` DROP FOREIGN KEY \`FK_5a422fea5e5a5a14291691cea05\``);
        await queryRunner.query(`DROP TABLE \`swab_area_image\``);
        await queryRunner.query(`DROP TABLE \`swab_area_history\``);
    }

}
