import { Post } from "./../entities/Post";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { MyContext } from "src/types";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    posts(
        @Ctx() ctx: MyContext
    ): Promise<Post[]> {
        return ctx.em.find(Post, {});
    }

    @Query(() => Post, {nullable: true})
    post(
        @Arg('id', () => Int) id: number,
        @Ctx() ctx: MyContext
    ): Promise<Post | null> {
        return ctx.em.findOne(Post, {id});
    }

    @Mutation(() => Post)
    async createPost(
        @Arg('title') title: string,
        @Ctx() ctx: MyContext
    ): Promise<Post> {
        const post = ctx.em.create(Post, {title});
        await ctx.em.persistAndFlush(post);
        return post;
    }

    @Mutation(() => Post, {nullable: true})
    async updatePost(
        @Arg('id') id: number,
        @Arg('title', () => String, {nullable: true}) title: string,
        @Ctx() ctx: MyContext
    ): Promise<Post | null> {
        const post = await ctx.em.findOne(Post, {id});
        if (!post) {
            return null;
        }
        post.title = typeof title !== 'undefined' ? title : post.title;
        await ctx.em.persistAndFlush(post);
        return post;
    }

    @Mutation(() => Boolean, {nullable: true})
    async deletePost(
        @Arg('id') id: number,
        @Ctx() ctx: MyContext
    ): Promise<Boolean> {
        await ctx.em.nativeDelete(Post, {id});
        return true;
    }

}