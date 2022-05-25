import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Updoot } from "./Updoot";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number; // string is also supported

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({type: "int", default: 0})
  points!: number;


  @Field()
  @Column()
  creatorId: number;

  @Field()
  @ManyToMany(() => User, user => user.posts)
  creator: User;

  @OneToMany(() => Updoot, updoot => updoot.postId)
  updoots: Updoot[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt? = Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt? = Date;

}