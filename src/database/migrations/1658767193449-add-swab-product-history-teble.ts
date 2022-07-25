import { MigrationInterface, QueryRunner } from "typeorm";

export class addSwabProductHistoryTeble1658767193449 implements MigrationInterface {
    name = 'addSwabProductHistoryTeble1658767193449'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`swab_product_history\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`product_id\` varchar(255) NULL, \`swab_product_lot\` varchar(255) NOT NULL, \`shift\` enum ('day', 'night') NULL, \`swab_product_date\` date NOT NULL, \`swab_product_swabed_at\` time NULL, \`swab_test_id\` bigint NULL, UNIQUE INDEX \`REL_c62ce25cf55e6a376ee270b101\` (\`swab_test_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` ADD CONSTRAINT \`FK_4273c86846386a862c60a1b08c6\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` ADD CONSTRAINT \`FK_c62ce25cf55e6a376ee270b1018\` FOREIGN KEY (\`swab_test_id\`) REFERENCES \`swab_test\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` DROP FOREIGN KEY \`FK_c62ce25cf55e6a376ee270b1018\``);
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` DROP FOREIGN KEY \`FK_4273c86846386a862c60a1b08c6\``);
        await queryRunner.query(`DROP INDEX \`REL_c62ce25cf55e6a376ee270b101\` ON \`swab_product_history\``);
        await queryRunner.query(`DROP TABLE \`swab_product_history\``);
    }

}
