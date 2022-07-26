import { MigrationInterface, QueryRunner } from "typeorm";

export class initial1658842479406 implements MigrationInterface {
    name = 'initial1658842479406'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`swab_area\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`swab_area_name\` varchar(255) NOT NULL, \`main_swab_area_id\` varchar(255) NULL, \`facility_id\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`facility\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`facility_name\` varchar(255) NOT NULL, \`facility_type\` enum ('machine', 'vehical', 'tool') NOT NULL, UNIQUE INDEX \`IDX_4f1ace4712ad4c9d1faa18ece3\` (\`facility_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`zone\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`zone_name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_7a30dbf9d42907460e25ad5c29\` (\`zone_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`room\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`room_name\` varchar(255) NOT NULL, \`zone_id\` varchar(255) NULL, UNIQUE INDEX \`IDX_ecffbe9c186305d63c6284bfef\` (\`room_name\`, \`zone_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`facility_item\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`facility_item_name\` varchar(255) NOT NULL, \`facility_id\` varchar(255) NULL, \`room_id\` varchar(255) NULL, \`zone_id\` varchar(255) NULL, UNIQUE INDEX \`IDX_f4a3c4968f0e01a1b1ad76542b\` (\`facility_item_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`swab_area_history_image\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`swab_area_history_image_url\` text NOT NULL, \`swab_area_history_image_description\` text NULL, \`swab_area_history_id\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`swab_environment\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`swab_environment_name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_4f14fa352abc1aaf150d050a2b\` (\`swab_environment_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`swab_period\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`swab_period_name\` varchar(255) NOT NULL, \`depends_on_shift\` tinyint NOT NULL, UNIQUE INDEX \`IDX_882badc02340dcc2472f33027e\` (\`swab_period_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`swab_test\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`swab_test_code\` varchar(255) NOT NULL, \`listeria_mono_detected\` tinyint NULL, \`listeria_mono_value\` float NULL, UNIQUE INDEX \`IDX_97cba9402041a204c2fedc9d38\` (\`swab_test_code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`swab_area_history\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`swab_area_date\` date NOT NULL, \`swab_area_swabed_at\` time NULL, \`swab_area_temperature\` decimal(3,1) NULL, \`swab_area_humidity\` decimal(3,1) NULL, \`swab_area_atp\` int NULL, \`swab_area_note\` text NULL, \`swab_period_id\` varchar(255) NULL, \`swab_area_id\` varchar(255) NULL, \`swab_test_id\` bigint NULL, \`shift\` enum ('day', 'night') NULL, \`product_id\` varchar(255) NULL, \`product_date\` date NULL, \`product_lot\` varchar(255) NULL, \`facility_item_id\` varchar(255) NULL, UNIQUE INDEX \`REL_e73987a66b8f766eda9cf7554e\` (\`swab_test_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`swab_product_history\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`product_id\` varchar(255) NULL, \`swab_product_lot\` varchar(255) NOT NULL, \`shift\` enum ('day', 'night') NULL, \`swab_product_date\` date NOT NULL, \`swab_product_swabed_at\` time NULL, \`swab_test_id\` bigint NULL, UNIQUE INDEX \`REL_c62ce25cf55e6a376ee270b101\` (\`swab_test_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`product_code\` varchar(8) NOT NULL, \`alternate_product_code\` varchar(8) NOT NULL, \`product_name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_fb912a8e66bfe036057ba4651f\` (\`product_code\`), UNIQUE INDEX \`IDX_3d4628fd27bebc45bb276c3ae3\` (\`alternate_product_code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_schedule\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`product_schedule_amount\` int NOT NULL, \`product_schedule_date\` date NOT NULL, \`product_schedule_started_at\` time NOT NULL, \`product_schedule_ended_at\` time NOT NULL, \`product_id\` varchar(255) NULL, \`import_transaction_id\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`import_transaction\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`import_source\` enum ('web', 'operator') NOT NULL, \`import_type\` enum ('product_schedule', 'cleaning_plan', 'cleaning_room_history') NOT NULL, \`import_status\` enum ('pending', 'success', 'cancel') NOT NULL DEFAULT 'pending', \`imported_file_url\` text NULL, \`imported_file_name\` text NULL, \`imported_user_id\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`user_name\` varchar(255) NOT NULL, \`email\` varchar(255) NULL, \`password\` varchar(255) NOT NULL, \`first_name\` varchar(255) NULL, \`last_name\` varchar(255) NULL, \`role\` enum ('admin', 'user') NOT NULL, \`team\` enum ('admin', 'qa', 'swab', 'lab', 'production') NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`swab_area_history_swab_environments_swab_environment\` (\`swab_area_history_id\` varchar(36) NOT NULL, \`swab_environment_id\` varchar(36) NOT NULL, INDEX \`IDX_2d8c0485d2b349120ef3570d1f\` (\`swab_area_history_id\`), INDEX \`IDX_91131c9ab12f4257151b7aae24\` (\`swab_environment_id\`), PRIMARY KEY (\`swab_area_history_id\`, \`swab_environment_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`swab_area\` ADD CONSTRAINT \`FK_270858837c35d07c113f0702ac3\` FOREIGN KEY (\`main_swab_area_id\`) REFERENCES \`swab_area\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_area\` ADD CONSTRAINT \`FK_1c1f1838fbdfb5e053f2a7b2b44\` FOREIGN KEY (\`facility_id\`) REFERENCES \`facility\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`room\` ADD CONSTRAINT \`FK_ccb953914396483e92f688419dc\` FOREIGN KEY (\`zone_id\`) REFERENCES \`zone\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`facility_item\` ADD CONSTRAINT \`FK_b0b22a288366ab2798d61469f9b\` FOREIGN KEY (\`facility_id\`) REFERENCES \`facility\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`facility_item\` ADD CONSTRAINT \`FK_e68f39effba6ce59c6ec7420545\` FOREIGN KEY (\`room_id\`) REFERENCES \`room\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`facility_item\` ADD CONSTRAINT \`FK_211ddb6da17b9b8c5a1c67b8b19\` FOREIGN KEY (\`zone_id\`) REFERENCES \`zone\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history_image\` ADD CONSTRAINT \`FK_53b71156bad42caa95e2fb5a0a1\` FOREIGN KEY (\`swab_area_history_id\`) REFERENCES \`swab_area_history\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD CONSTRAINT \`FK_864165df74f622596e14f598bf2\` FOREIGN KEY (\`swab_period_id\`) REFERENCES \`swab_period\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD CONSTRAINT \`FK_70d0a5e03297084e399a5544579\` FOREIGN KEY (\`swab_area_id\`) REFERENCES \`swab_area\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD CONSTRAINT \`FK_e73987a66b8f766eda9cf7554ef\` FOREIGN KEY (\`swab_test_id\`) REFERENCES \`swab_test\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD CONSTRAINT \`FK_91abbb1db891e6899999f11fd32\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD CONSTRAINT \`FK_fedab6504b63b565d41359b24e8\` FOREIGN KEY (\`facility_item_id\`) REFERENCES \`facility_item\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` ADD CONSTRAINT \`FK_4273c86846386a862c60a1b08c6\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` ADD CONSTRAINT \`FK_c62ce25cf55e6a376ee270b1018\` FOREIGN KEY (\`swab_test_id\`) REFERENCES \`swab_test\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` ADD CONSTRAINT \`FK_0a9812942542b75d849d915e716\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` ADD CONSTRAINT \`FK_7e2c234e2e7e1cc8420877e3588\` FOREIGN KEY (\`import_transaction_id\`) REFERENCES \`import_transaction\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`import_transaction\` ADD CONSTRAINT \`FK_1a924b0c79dbc36791da271c4bf\` FOREIGN KEY (\`imported_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history_swab_environments_swab_environment\` ADD CONSTRAINT \`FK_2d8c0485d2b349120ef3570d1f9\` FOREIGN KEY (\`swab_area_history_id\`) REFERENCES \`swab_area_history\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history_swab_environments_swab_environment\` ADD CONSTRAINT \`FK_91131c9ab12f4257151b7aae243\` FOREIGN KEY (\`swab_environment_id\`) REFERENCES \`swab_environment\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history_swab_environments_swab_environment\` DROP FOREIGN KEY \`FK_91131c9ab12f4257151b7aae243\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history_swab_environments_swab_environment\` DROP FOREIGN KEY \`FK_2d8c0485d2b349120ef3570d1f9\``);
        await queryRunner.query(`ALTER TABLE \`import_transaction\` DROP FOREIGN KEY \`FK_1a924b0c79dbc36791da271c4bf\``);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` DROP FOREIGN KEY \`FK_7e2c234e2e7e1cc8420877e3588\``);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` DROP FOREIGN KEY \`FK_0a9812942542b75d849d915e716\``);
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` DROP FOREIGN KEY \`FK_c62ce25cf55e6a376ee270b1018\``);
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` DROP FOREIGN KEY \`FK_4273c86846386a862c60a1b08c6\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP FOREIGN KEY \`FK_fedab6504b63b565d41359b24e8\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP FOREIGN KEY \`FK_91abbb1db891e6899999f11fd32\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP FOREIGN KEY \`FK_e73987a66b8f766eda9cf7554ef\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP FOREIGN KEY \`FK_70d0a5e03297084e399a5544579\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP FOREIGN KEY \`FK_864165df74f622596e14f598bf2\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history_image\` DROP FOREIGN KEY \`FK_53b71156bad42caa95e2fb5a0a1\``);
        await queryRunner.query(`ALTER TABLE \`facility_item\` DROP FOREIGN KEY \`FK_211ddb6da17b9b8c5a1c67b8b19\``);
        await queryRunner.query(`ALTER TABLE \`facility_item\` DROP FOREIGN KEY \`FK_e68f39effba6ce59c6ec7420545\``);
        await queryRunner.query(`ALTER TABLE \`facility_item\` DROP FOREIGN KEY \`FK_b0b22a288366ab2798d61469f9b\``);
        await queryRunner.query(`ALTER TABLE \`room\` DROP FOREIGN KEY \`FK_ccb953914396483e92f688419dc\``);
        await queryRunner.query(`ALTER TABLE \`swab_area\` DROP FOREIGN KEY \`FK_1c1f1838fbdfb5e053f2a7b2b44\``);
        await queryRunner.query(`ALTER TABLE \`swab_area\` DROP FOREIGN KEY \`FK_270858837c35d07c113f0702ac3\``);
        await queryRunner.query(`DROP INDEX \`IDX_91131c9ab12f4257151b7aae24\` ON \`swab_area_history_swab_environments_swab_environment\``);
        await queryRunner.query(`DROP INDEX \`IDX_2d8c0485d2b349120ef3570d1f\` ON \`swab_area_history_swab_environments_swab_environment\``);
        await queryRunner.query(`DROP TABLE \`swab_area_history_swab_environments_swab_environment\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`import_transaction\``);
        await queryRunner.query(`DROP TABLE \`product_schedule\``);
        await queryRunner.query(`DROP INDEX \`IDX_3d4628fd27bebc45bb276c3ae3\` ON \`product\``);
        await queryRunner.query(`DROP INDEX \`IDX_fb912a8e66bfe036057ba4651f\` ON \`product\``);
        await queryRunner.query(`DROP TABLE \`product\``);
        await queryRunner.query(`DROP INDEX \`REL_c62ce25cf55e6a376ee270b101\` ON \`swab_product_history\``);
        await queryRunner.query(`DROP TABLE \`swab_product_history\``);
        await queryRunner.query(`DROP INDEX \`REL_e73987a66b8f766eda9cf7554e\` ON \`swab_area_history\``);
        await queryRunner.query(`DROP TABLE \`swab_area_history\``);
        await queryRunner.query(`DROP INDEX \`IDX_97cba9402041a204c2fedc9d38\` ON \`swab_test\``);
        await queryRunner.query(`DROP TABLE \`swab_test\``);
        await queryRunner.query(`DROP INDEX \`IDX_882badc02340dcc2472f33027e\` ON \`swab_period\``);
        await queryRunner.query(`DROP TABLE \`swab_period\``);
        await queryRunner.query(`DROP INDEX \`IDX_4f14fa352abc1aaf150d050a2b\` ON \`swab_environment\``);
        await queryRunner.query(`DROP TABLE \`swab_environment\``);
        await queryRunner.query(`DROP TABLE \`swab_area_history_image\``);
        await queryRunner.query(`DROP INDEX \`IDX_f4a3c4968f0e01a1b1ad76542b\` ON \`facility_item\``);
        await queryRunner.query(`DROP TABLE \`facility_item\``);
        await queryRunner.query(`DROP INDEX \`IDX_ecffbe9c186305d63c6284bfef\` ON \`room\``);
        await queryRunner.query(`DROP TABLE \`room\``);
        await queryRunner.query(`DROP INDEX \`IDX_7a30dbf9d42907460e25ad5c29\` ON \`zone\``);
        await queryRunner.query(`DROP TABLE \`zone\``);
        await queryRunner.query(`DROP INDEX \`IDX_4f1ace4712ad4c9d1faa18ece3\` ON \`facility\``);
        await queryRunner.query(`DROP TABLE \`facility\``);
        await queryRunner.query(`DROP TABLE \`swab_area\``);
    }

}
