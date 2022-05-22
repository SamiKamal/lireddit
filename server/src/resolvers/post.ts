import { Post } from "./../entities/Post";
import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";
import { conn } from "./../index";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    posts(): Promise<Post[]> {
        return Post.find()
    }

    @Query(() => Post, {nullable: true})
    post(
        @Arg('id', () => Int) id: number
    ): Promise<Post | null> {
        return Post.findOneBy({id})
    }

    @Mutation(() => Post)
    async createPost(
        @Arg('title') title: string,
    ): Promise<Post> {
        let post: any = await conn
        .createQueryBuilder()
        .insert()
        .into(Post)
        .values({
            title: title,
        })
        .returning("*")
        .execute();

        post = post.raw[0]

        return post;
    }

    @Mutation(() => Post, {nullable: true})
    async updatePost(
        @Arg('id') id: number,
        @Arg('title', () => String, {nullable: true}) title: string,
    ): Promise<Post | null> {
        const post = await Post.findOneBy({id});
        if (!post) {
            return null;
        }
        if (typeof title !== 'undefined') {
            await Post.update({id}, {title})
        }
        return post;
    }

    @Mutation(() => Boolean, {nullable: true})
    async deletePost(
        @Arg('id') id: number,
    ): Promise<Boolean> {
        await Post.delete({id})
        return true;
    }

}