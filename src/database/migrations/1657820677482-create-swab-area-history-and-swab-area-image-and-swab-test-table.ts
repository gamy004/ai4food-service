import { MigrationInterface, QueryRunner } from "typeorm";

export class createSwabAreaHistoryAndSwabAreaImageAndSwabTestTable1657820677482 implements MigrationInterface {
    name = 'createSwabAreaHistoryAndSwabAreaImageAndSwabTestTable1657820677482'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`swab_area_image\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`swab_area_image_url\` text NOT NULL, \`swab_area_image_description\` text NULL, \`swab_area_history_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`swab_test\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`swab_test_code\` varchar(255) NULL, \`listeria_mono_detected\` tinyint NULL, \`listeria_mono_value\` float NULL, INDEX \`IDX_97cba9402041a204c2fedc9d38\` (\`swab_test_code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`swab_area_history\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`swab_area_date\` date NOT NULL, \`swab_area_swabed_at\` time NULL, \`swab_area_temperature\` decimal(2) NOT NULL, \`swab_area_humidity\` decimal(2) NOT NULL, \`swab_area_atp\` int NOT NULL, \`swab_test_id\` bigint NULL, UNIQUE INDEX \`REL_e73987a66b8f766eda9cf7554e\` (\`swab_test_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`swab_area_image\` ADD CONSTRAINT \`FK_5a422fea5e5a5a14291691cea05\` FOREIGN KEY (\`swab_area_history_id\`) REFERENCES \`swab_area_history\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD CONSTRAINT \`FK_e73987a66b8f766eda9cf7554ef\` FOREIGN KEY (\`swab_test_id\`) REFERENCES \`swab_test\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP FOREIGN KEY \`FK_e73987a66b8f766eda9cf7554ef\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_image\` DROP FOREIGN KEY \`FK_5a422fea5e5a5a14291691cea05\``);
        await queryRunner.query(`DROP INDEX \`REL_e73987a66b8f766eda9cf7554e\` ON \`swab_area_history\``);
        await queryRunner.query(`DROP TABLE \`swab_area_history\``);
        await queryRunner.query(`DROP INDEX \`IDX_97cba9402041a204c2fedc9d38\` ON \`swab_test\``);
        await queryRunner.query(`DROP TABLE \`swab_test\``);
        await queryRunner.query(`DROP TABLE \`swab_area_image\``);
    }

}
