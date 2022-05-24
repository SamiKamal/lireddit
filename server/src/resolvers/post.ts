import { Post } from "./../entities/Post";
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { conn } from "./../index";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";

@InputType()
class PostInput {
    @Field()
    title: string

    @Field()
    text: string
}


@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts!: Post[]

    @Field()
    hasMore!: boolean
}


@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(@Root() post: Post): string {
        return post.text.slice(0, 50);
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null
    ): Promise<PaginatedPosts> {
        // add additional post to check if there's more post
        const realLimit = Math.min(50, limit || 1);
        const realLimitPlusOne = realLimit + 1
        let posts: any = await conn
            .getRepository(Post)
            .createQueryBuilder("p")
            .orderBy('"createdAt"', "DESC")
            .take(realLimitPlusOne)

        if (cursor) {
            posts.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) })
        }
        posts = await posts.getMany()
        return {
            posts: posts.slice(0, realLimit),
            hasMore: posts.length === realLimitPlusOne
            };
    }

    @Query(() => Post, {nullable: true})
    post(
        @Arg('id', () => Int) id: number
    ): Promise<Post | null> {
        return Post.findOneBy({id})
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg('options') options: PostInput,
        @Ctx() {req}: MyContext
    ): Promise<Post> {
        let post: any = await conn
        .createQueryBuilder()
        .insert()
        .into(Post)
        .values({
            ...options,
            creatorId: req.session.userId
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