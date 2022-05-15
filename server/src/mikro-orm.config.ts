import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

export default {
    dbName: 'lireddit',
    allowGlobalContext: true,
    debug: __prod__,
    type: "postgresql",
    entities: [Post],
    password: process.env.DATABASE_PASSWORD,
    migrations: {
        path: path.join(__dirname, './migrations'),
        glob: '!(*.d).{js,ts}', // how to match migration files (all .js and .ts files, but not .d.ts)
    }
} as Parameters<typeof MikroORM.init>[0];