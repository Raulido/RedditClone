import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
//import { Post } from "./entities/post";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import {ApolloServer} from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import {createClient} from "redis";
import session from "express-session";
import connectRedis from 'connect-redis';
import { MyContext } from "./types";
import cors from 'cors';

// const {
//     graphqlUploadExpress, // A Koa implementation is also exported.
// } = require('graphql-upload');



const main = async () => {
    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();
    const em = orm.em.fork();

    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = createClient({ legacyMode: true });
    redisClient.connect().catch(console.error)

    app.set("trust proxy", !__prod__)
    const corsOptions = {origin: ['http://localhost:3000','https://studio.apollographql.com'], credentials: true};
    app.use(cors(corsOptions))

    app.use(
        session({
            name: 'rid',
            store: new RedisStore({ 
                client: redisClient as any,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
                httpOnly: __prod__,
                secure: __prod__,
                sameSite: 'lax',
            },
            saveUninitialized: false,
            secret: "asd5yfertyjimasdv",
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({req,res}: MyContext): MyContext => ({em, req, res}),
    });

    await apolloServer.start();
    apolloServer.applyMiddleware ({app ,cors: false});
    app.listen(4000, () => { 
        console.log('server started on localhost:4000')
    });
    
};
main().catch(err => {
    console.log(err);
});