import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
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
  @Column()
  title!: string;
}