import { Migration } from '@mikro-orm/migrations';

export class Migration20220624075544 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `user` add `last_name` varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `user` drop `last_name`;');
  }

}
