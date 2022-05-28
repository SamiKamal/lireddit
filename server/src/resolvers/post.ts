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
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
        @Ctx() {req}: MyContext
    ): Promise<PaginatedPosts> {
        // add additional post to check if there's more post
        const realLimit = Math.min(50, limit || 1);
        const realLimitPlusOne = realLimit + 1
        const replacements: any[] = [realLimitPlusOne]

        if (req.session.userId) {
            replacements.push(req.session.userId);
        }
        
        let cursorIndex = 3
        if (cursor) {            
            replacements.push(new Date(parseInt(cursor)));
            cursorIndex = replacements.length;
        }
        
        
        
        const posts = await conn.query(`
            select p.*,
            json_build_object(
                'id', u.id,
                'username', u.username,
                'email', u.email,
                'createdAt', u."createdAt",
                'updatedAt', u."updatedAt"
                ) creator,
            ${req.session.userId ? `(select value from updoot where "userId" = $2 and "postId" = p.id) "voteStatus"` : 'null as "voteStatus"' }
            from post p
            inner join public.user u on u.id = p."creatorId"
            ${cursor ? `where p."createdAt" < $${cursorIndex}` : ''}
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
        return Post.findOne({
            where: {
            id
            },
            relations: {
                creator: true
            }
        })
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
        @Arg('id',) id: number,
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
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() {req}: MyContext
    ): Promise<Boolean> {
        await Post.delete({id, creatorId: req.session.userId})
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
        const updoot = await Updoot.findOneBy({postId, userId})

        // user has voted on this post
        // but they're changing it
        if (updoot && updoot.value !== realValue) {
            await conn.transaction(async tm => {
                 await tm.query(`
                    update updoot
                    set value = ${realValue}
                    where "postId" = ${postId} and "userId" = ${userId};
                `)

                await tm.query(`
                    update post
                    set points = points + ${realValue * 2}
                    where id = ${postId};
                `)

            })

        // user didn't vote
        } else if (!updoot) {
            await conn.transaction(async tm => {
                await tm.query(`
                    insert into updoot ("userId", "postId", value)
                    values (${userId}, ${postId}, ${realValue});
                `)

                 await tm.query(`
                    update post
                    set points = points + ${realValue}
                    where id = ${postId};
                `)

            })
        }
        // await Updoot.insert({
        //     userId,
        //     postId,
        //     value: realValue
        // })


        return true
    }

}