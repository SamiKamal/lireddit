import "reflect-metadata"
import {MikroORM} from "@mikro-orm/core";
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import mikroOrmConfig from "./mikro-orm.config";
import express from 'express';
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import session from "express-session";
import { createClient } from "redis";
import connectRedis from 'connect-redis'
import env from 'dotenv'
import { MyContext } from "./types";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core"
env.config();



const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);
    await orm.getMigrator().up()

    const app = express();
    const PORT = process.env.PORT || 4000

    const RedisStore = connectRedis(session)
    const redisClient = createClient({ legacyMode: true })
    redisClient.connect().catch(console.error)


    app.use(
    session({
        name: "qid",
        store: new RedisStore({ 
            client: redisClient as any,
            disableTouch: true,
         }),
         cookie: {
             maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
             httpOnly: true,
             secure: false, // cookie only works in https
             sameSite: 'lax',
         },
        saveUninitialized: false,
        secret: process.env.REDIS_SECRET as string,
        resave: false,
    })
    )


    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({req, res}): MyContext => ({em: orm.em, req, res}),
        plugins: [ApolloServerPluginLandingPageGraphQLPlayground({
        settings: {
            "request.credentials": "include"
        }
})]
    })
    await apolloServer.start();
    apolloServer.applyMiddleware({app})
    app.listen(PORT, () => {
        console.log('Server started listenning on ' + PORT);
        
    })
    
};

main()