import "reflect-metadata"
import { COOKIE_NAME, __prod__ } from "./constants";
import express from 'express';
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import session from "express-session";
import Redis from "ioredis";
import connectRedis from 'connect-redis'
import env from 'dotenv'
import { MyContext } from "./types";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core"
import cors from 'cors'
import {DataSource} from "typeorm"
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { Updoot } from "./entities/Updoot";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";

env.config();

export const conn = new DataSource({
    type: "postgres",
    database: "lireddit2",
    username: "postgres",
    password: process.env.DATABASE_PASSWORD,
    logging: true,
    synchronize: true,
    entities: [User, Post, Updoot]
});


const main = async () => {
    await conn.initialize()

    const app = express();
    const PORT = process.env.PORT || 4000

    const RedisStore = connectRedis(session)
    const redisClient = new Redis()
    redisClient.connect().catch(console.error)

    app.use(cors({
        origin: "http://localhost:3000",
        credentials: true
    }))
    app.use(
    session({
        name: COOKIE_NAME,
        store: new RedisStore({ 
            client: redisClient as any,
            disableTouch: true,
         }),
         cookie: {
             maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
             httpOnly: __prod__,
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
        context: ({req, res}): MyContext => ({req, res, redis: redisClient, userLoader: createUserLoader(), updootLoader: createUpdootLoader()}),
        plugins: [ApolloServerPluginLandingPageGraphQLPlayground({
        settings: {
            "request.credentials": "include"
        }
})]
    })
    await apolloServer.start();
    apolloServer.applyMiddleware({app, cors: false})
    app.listen(PORT, () => {
        console.log('Server started listenning on ' + PORT);
        
    })
    
};

main()