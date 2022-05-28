import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
  @Field()
  @Column({type: "int"})
  value: number

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field(() => User)
  @ManyToMany(() => User, user => user.updoots)
  user: User;

  @Field()
  @PrimaryColumn()
  postId: number;

  @Field(() => Post)
  @ManyToMany(() => Post, post => post.updoots, {
    onDelete: 'CASCADE'
  })
  post: Post;
}