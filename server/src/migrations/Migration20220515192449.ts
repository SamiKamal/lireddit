import { Migration } from '@mikro-orm/migrations';

export class Migration20220515192449 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "post" ("id" serial primary key, "ceated_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" text not null);');
  }

}
