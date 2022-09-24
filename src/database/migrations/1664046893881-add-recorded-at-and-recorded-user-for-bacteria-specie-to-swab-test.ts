import { MigrationInterface, QueryRunner } from "typeorm";

export class addRecordedAtAndRecordedUserForBacteriaSpecieToSwabTest1664046893881 implements MigrationInterface {
    name = 'addRecordedAtAndRecordedUserForBacteriaSpecieToSwabTest1664046893881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD \`bacteria_recorded_at\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD \`bacteria_specie_recorded_at\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD \`bacteria_recorded_user_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD \`bacteria_specie_recorded_user_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD CONSTRAINT \`FK_16f06c987cd29ea4fcaafa8b1d1\` FOREIGN KEY (\`bacteria_recorded_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD CONSTRAINT \`FK_c4a66f816b236a5d2162cde60de\` FOREIGN KEY (\`bacteria_specie_recorded_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP FOREIGN KEY \`FK_c4a66f816b236a5d2162cde60de\``);
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP FOREIGN KEY \`FK_16f06c987cd29ea4fcaafa8b1d1\``);
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP COLUMN \`bacteria_specie_recorded_user_id\``);
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP COLUMN \`bacteria_recorded_user_id\``);
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP COLUMN \`bacteria_specie_recorded_at\``);
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP COLUMN \`bacteria_recorded_at\``);
    }

}
