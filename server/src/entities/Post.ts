import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Post {

  @PrimaryKey()
  id!: number; // string is also supported

  @Property({type: "date"})
  ceatedAt? = new Date();

  @Property({onUpdate: () => new Date(), type: "date"})
  updatedAt? = new Date();


  @Property({type: "text"})
  title!: string;
}