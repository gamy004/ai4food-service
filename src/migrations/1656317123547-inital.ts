import { MigrationInterface, QueryRunner } from "typeorm";

export class inital1656317123547 implements MigrationInterface {
    name = 'inital1656317123547'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`product\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`product_code\` varchar(8) NOT NULL, \`product_name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_fb912a8e66bfe036057ba4651f\` (\`product_code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_schedule\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`product_schedule_amount\` int NOT NULL, \`product_schedule_date\` date NOT NULL, \`product_schedule_started_at\` time NOT NULL, \`product_schedule_ended_at\` time NOT NULL, \`product_id\` varchar(36) NULL, \`import_transaction_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`user_name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`first_name\` varchar(255) NOT NULL, \`last_name\` varchar(255) NOT NULL, \`role\` enum ('admin', 'user') NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`import_transaction\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`transaction_number\` varchar(255) NOT NULL, \`import_type\` enum ('production_schedule', 'cleaning_plan', 'cleaning_room_history') NULL, \`imported_user_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` ADD CONSTRAINT \`FK_0a9812942542b75d849d915e716\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` ADD CONSTRAINT \`FK_7e2c234e2e7e1cc8420877e3588\` FOREIGN KEY (\`import_transaction_id\`) REFERENCES \`import_transaction\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`import_transaction\` ADD CONSTRAINT \`FK_1a924b0c79dbc36791da271c4bf\` FOREIGN KEY (\`imported_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`import_transaction\` DROP FOREIGN KEY \`FK_1a924b0c79dbc36791da271c4bf\``);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` DROP FOREIGN KEY \`FK_7e2c234e2e7e1cc8420877e3588\``);
        await queryRunner.query(`ALTER TABLE \`product_schedule\` DROP FOREIGN KEY \`FK_0a9812942542b75d849d915e716\``);
        await queryRunner.query(`DROP TABLE \`import_transaction\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`product_schedule\``);
        await queryRunner.query(`DROP INDEX \`IDX_fb912a8e66bfe036057ba4651f\` ON \`product\``);
        await queryRunner.query(`DROP TABLE \`product\``);
    }

}
