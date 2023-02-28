import { MigrationInterface, QueryRunner } from "typeorm";

export class changeSwabAreaHistoryIdInCleaningHistory1676477289016 implements MigrationInterface {
    name = 'changeSwabAreaHistoryIdInCleaningHistory1676477289016'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP FOREIGN KEY \`FK_812f367be2d5f1afa41b5baccff\``);
        await queryRunner.query(`DROP INDEX \`REL_812f367be2d5f1afa41b5baccf\` ON \`swab_area_history\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP COLUMN \`cleaning_history_id\``);
        await queryRunner.query(`ALTER TABLE \`cleaning_history\` ADD \`swab_area_history_id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`cleaning_history\` ADD UNIQUE INDEX \`IDX_a0458c04a096e72617aa745599\` (\`swab_area_history_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_a0458c04a096e72617aa745599\` ON \`cleaning_history\` (\`swab_area_history_id\`)`);
        await queryRunner.query(`ALTER TABLE \`cleaning_history\` ADD CONSTRAINT \`FK_a0458c04a096e72617aa7455990\` FOREIGN KEY (\`swab_area_history_id\`) REFERENCES \`swab_area_history\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cleaning_history\` DROP FOREIGN KEY \`FK_a0458c04a096e72617aa7455990\``);
        await queryRunner.query(`DROP INDEX \`REL_a0458c04a096e72617aa745599\` ON \`cleaning_history\``);
        await queryRunner.query(`ALTER TABLE \`cleaning_history\` DROP INDEX \`IDX_a0458c04a096e72617aa745599\``);
        await queryRunner.query(`ALTER TABLE \`cleaning_history\` DROP COLUMN \`swab_area_history_id\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD \`cleaning_history_id\` varchar(36) NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_812f367be2d5f1afa41b5baccf\` ON \`swab_area_history\` (\`cleaning_history_id\`)`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD CONSTRAINT \`FK_812f367be2d5f1afa41b5baccff\` FOREIGN KEY (\`cleaning_history_id\`) REFERENCES \`cleaning_history\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
