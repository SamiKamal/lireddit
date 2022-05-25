import { Post } from "./../entities/Post";
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { conn } from "./../index";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";
import { Updoot } from "./../entities/Updoot";

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
        const replacements: any[] = [realLimitPlusOne]

        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }

        const posts = await conn.query(`
            select p.*,
            json_build_object(
                'id', u.id,
                'username', u.username,
                'email', u.email
                ) creator
            from post p
            inner join public.user u on u.id = p."creatorId"
            ${cursor ? 'where p."createdAt" < $2' : ''}
            order by p."createdAt" DESC
            limit $1
        `, replacements)
        

        // let posts: any = await conn
        //     .getRepository(Post)
        //     .createQueryBuilder("p")
        //     .innerJoinAndSelect(
        //         'p.creator',
        //         'u',
        //         'u.id = p."creatorId"'
        //     )
        //     .orderBy('p."createdAt"', "DESC")
        //     .take(realLimitPlusOne)

        // if (cursor) {
        //     posts.where('p."createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) })
        // }
        // posts = await posts.getMany()
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

    @Mutation(() => Boolean)
    async vote(
        @Arg("postId", () => Int) postId: number,
        @Arg("value", () => Int) value: number,
        @Ctx() {req}: MyContext
    ) {
        const isUpdoot = value !== -1;
        const realValue = isUpdoot ? 1 : -1;
        const {userId} = req.session;
        // await Updoot.insert({
        //     userId,
        //     postId,
        //     value: realValue
        // })

        await conn.query(`
            START TRANSACTION;
            insert into updoot ("userId", "postId", value)
            values (${userId}, ${postId}, ${realValue});
            update post
            set points = points + ${realValue}
            where id = ${postId};
            COMMIT;
        `)

        return true
    }

}