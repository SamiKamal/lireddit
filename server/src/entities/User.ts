import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User {
  @Field(() => Int)
  @PrimaryKey()
  id!: number; // string is also supported

  @Field(() => String)
  @Property({type: "date"})
  createdAt? = new Date();

  @Field(() => String)
  @Property({onUpdate: () => new Date(), type: "date"})
  updatedAt? = new Date();

  @Field()
  @Property({unique: true})
  username!: string;

  @Field()
  @Property({unique: true})
  email!: string;

  @Field()
  @Property()
  password!: string;

}