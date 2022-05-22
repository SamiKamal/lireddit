import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number; // string is also supported

  @Field(() => String)
  @CreateDateColumn()
  createdAt? = Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt? = Date;

  @Field()
  @Column({unique: true})
  username!: string;

  @Field()
  @Column({unique: true})
  email!: string;

  @Field()
  @Column()
  password!: string;

}