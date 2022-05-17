import { Migration } from '@mikro-orm/migrations';

export class Migration20220516172715 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" rename column "ceated_at" to "created_at";');

    this.addSql('alter table "post" rename column "ceated_at" to "created_at";');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" rename column "created_at" to "ceated_at";');

    this.addSql('alter table "post" rename column "created_at" to "ceated_at";');
  }

}
