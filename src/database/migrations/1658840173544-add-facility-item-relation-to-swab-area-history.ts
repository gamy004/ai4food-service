import { MigrationInterface, QueryRunner } from "typeorm";

export class addFacilityItemRelationToSwabAreaHistory1658840173544 implements MigrationInterface {
    name = 'addFacilityItemRelationToSwabAreaHistory1658840173544'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD \`facility_item_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD CONSTRAINT \`FK_fedab6504b63b565d41359b24e8\` FOREIGN KEY (\`facility_item_id\`) REFERENCES \`facility_item\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP FOREIGN KEY \`FK_fedab6504b63b565d41359b24e8\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP COLUMN \`facility_item_id\``);
    }

}
