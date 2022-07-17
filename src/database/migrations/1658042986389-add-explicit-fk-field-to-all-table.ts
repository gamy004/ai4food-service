import { MigrationInterface, QueryRunner } from "typeorm";

export class addExplicitFkFieldToAllTable1658042986389 implements MigrationInterface {
    name = 'addExplicitFkFieldToAllTable1658042986389'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD \`shift\` enum ('day', 'night') NULL`);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` DROP FOREIGN KEY \`FK_0a9812942542b75d849d915e716\``);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` DROP FOREIGN KEY \`FK_7e2c234e2e7e1cc8420877e3588\``);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` DROP COLUMN \`product_id\``);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` ADD \`product_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` DROP COLUMN \`import_transaction_id\``);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` ADD \`import_transaction_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`import_transaction\` DROP FOREIGN KEY \`FK_1a924b0c79dbc36791da271c4bf\``);
        await queryRunner.query(`ALTER TABLE \`import_transaction\` DROP COLUMN \`imported_user_id\``);
        await queryRunner.query(`ALTER TABLE \`import_transaction\` ADD \`imported_user_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area_image\` DROP FOREIGN KEY \`FK_5a422fea5e5a5a14291691cea05\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_image\` DROP COLUMN \`swab_area_history_id\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_image\` ADD \`swab_area_history_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area\` DROP FOREIGN KEY \`FK_72aa4d4c72758b89505b1d661ff\``);
        await queryRunner.query(`ALTER TABLE \`swab_area\` DROP COLUMN \`facility_item_id\``);
        await queryRunner.query(`ALTER TABLE \`swab_area\` ADD \`facility_item_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`room\` DROP FOREIGN KEY \`FK_ccb953914396483e92f688419dc\``);
        await queryRunner.query(`DROP INDEX \`IDX_ecffbe9c186305d63c6284bfef\` ON \`room\``);
        await queryRunner.query(`ALTER TABLE \`room\` DROP COLUMN \`zone_id\``);
        await queryRunner.query(`ALTER TABLE \`room\` ADD \`zone_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`facility_item\` DROP FOREIGN KEY \`FK_b0b22a288366ab2798d61469f9b\``);
        await queryRunner.query(`ALTER TABLE \`facility_item\` DROP FOREIGN KEY \`FK_e68f39effba6ce59c6ec7420545\``);
        await queryRunner.query(`ALTER TABLE \`facility_item\` DROP FOREIGN KEY \`FK_211ddb6da17b9b8c5a1c67b8b19\``);
        await queryRunner.query(`ALTER TABLE \`facility_item\` DROP COLUMN \`facility_id\``);
        await queryRunner.query(`ALTER TABLE \`facility_item\` ADD \`facility_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`facility_item\` DROP COLUMN \`room_id\``);
        await queryRunner.query(`ALTER TABLE \`facility_item\` ADD \`room_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`facility_item\` DROP COLUMN \`zone_id\``);
        await queryRunner.query(`ALTER TABLE \`facility_item\` ADD \`zone_id\` varchar(255) NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_ecffbe9c186305d63c6284bfef\` ON \`room\` (\`room_name\`, \`zone_id\`)`);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` ADD CONSTRAINT \`FK_0a9812942542b75d849d915e716\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` ADD CONSTRAINT \`FK_7e2c234e2e7e1cc8420877e3588\` FOREIGN KEY (\`import_transaction_id\`) REFERENCES \`import_transaction\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`import_transaction\` ADD CONSTRAINT \`FK_1a924b0c79dbc36791da271c4bf\` FOREIGN KEY (\`imported_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_area_image\` ADD CONSTRAINT \`FK_5a422fea5e5a5a14291691cea05\` FOREIGN KEY (\`swab_area_history_id\`) REFERENCES \`swab_area_history\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_area\` ADD CONSTRAINT \`FK_72aa4d4c72758b89505b1d661ff\` FOREIGN KEY (\`facility_item_id\`) REFERENCES \`facility_item\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
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
        await queryRunner.query(`ALTER TABLE \`swab_area\` DROP FOREIGN KEY \`FK_72aa4d4c72758b89505b1d661ff\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_image\` DROP FOREIGN KEY \`FK_5a422fea5e5a5a14291691cea05\``);
        await queryRunner.query(`ALTER TABLE \`import_transaction\` DROP FOREIGN KEY \`FK_1a924b0c79dbc36791da271c4bf\``);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` DROP FOREIGN KEY \`FK_7e2c234e2e7e1cc8420877e3588\``);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` DROP FOREIGN KEY \`FK_0a9812942542b75d849d915e716\``);
        await queryRunner.query(`DROP INDEX \`IDX_ecffbe9c186305d63c6284bfef\` ON \`room\``);
        await queryRunner.query(`ALTER TABLE \`facility_item\` DROP COLUMN \`zone_id\``);
        await queryRunner.query(`ALTER TABLE \`facility_item\` ADD \`zone_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`facility_item\` DROP COLUMN \`room_id\``);
        await queryRunner.query(`ALTER TABLE \`facility_item\` ADD \`room_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`facility_item\` DROP COLUMN \`facility_id\``);
        await queryRunner.query(`ALTER TABLE \`facility_item\` ADD \`facility_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`facility_item\` ADD CONSTRAINT \`FK_211ddb6da17b9b8c5a1c67b8b19\` FOREIGN KEY (\`zone_id\`) REFERENCES \`zone\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`facility_item\` ADD CONSTRAINT \`FK_e68f39effba6ce59c6ec7420545\` FOREIGN KEY (\`room_id\`) REFERENCES \`room\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`facility_item\` ADD CONSTRAINT \`FK_b0b22a288366ab2798d61469f9b\` FOREIGN KEY (\`facility_id\`) REFERENCES \`facility\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`room\` DROP COLUMN \`zone_id\``);
        await queryRunner.query(`ALTER TABLE \`room\` ADD \`zone_id\` varchar(36) NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_ecffbe9c186305d63c6284bfef\` ON \`room\` (\`room_name\`, \`zone_id\`)`);
        await queryRunner.query(`ALTER TABLE \`room\` ADD CONSTRAINT \`FK_ccb953914396483e92f688419dc\` FOREIGN KEY (\`zone_id\`) REFERENCES \`zone\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_area\` DROP COLUMN \`facility_item_id\``);
        await queryRunner.query(`ALTER TABLE \`swab_area\` ADD \`facility_item_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area\` ADD CONSTRAINT \`FK_72aa4d4c72758b89505b1d661ff\` FOREIGN KEY (\`facility_item_id\`) REFERENCES \`facility_item\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_area_image\` DROP COLUMN \`swab_area_history_id\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_image\` ADD \`swab_area_history_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area_image\` ADD CONSTRAINT \`FK_5a422fea5e5a5a14291691cea05\` FOREIGN KEY (\`swab_area_history_id\`) REFERENCES \`swab_area_history\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`import_transaction\` DROP COLUMN \`imported_user_id\``);
        await queryRunner.query(`ALTER TABLE \`import_transaction\` ADD \`imported_user_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`import_transaction\` ADD CONSTRAINT \`FK_1a924b0c79dbc36791da271c4bf\` FOREIGN KEY (\`imported_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` DROP COLUMN \`import_transaction_id\``);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` ADD \`import_transaction_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` DROP COLUMN \`product_id\``);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` ADD \`product_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` ADD CONSTRAINT \`FK_7e2c234e2e7e1cc8420877e3588\` FOREIGN KEY (\`import_transaction_id\`) REFERENCES \`import_transaction\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` ADD CONSTRAINT \`FK_0a9812942542b75d849d915e716\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP COLUMN \`shift\``);
    }

}
