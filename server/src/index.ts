import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { COOKIE_NAME, __prod__ } from "./constants";
//import { Post } from "./entities/post";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import {ApolloServer} from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
// import {createClient} from "redis";
import session from "express-session";
import connectRedis from 'connect-redis';
import { MyContext } from "./types";
import cors from 'cors';
// import { sendEmail } from "./utils/sendEmail";
// import { User } from "./entities/user";
import Redis from "ioredis";
// import RedisClient from "@redis/client/dist/lib/client";


const main = async () => {
    // sendEmail('raul@raul.com',"Yo")
    const orm = await MikroORM.init(mikroConfig);
    // orm.em.nativeDelete(User, {})
    await orm.getMigrator().up();
    const em = orm.em.fork();

    const app = express();

    const RedisStore = connectRedis(session);
    // const redisClient = createClient({ legacyMode: true });
    const redis = new Redis();
    // redis.connect().catch(console.error);

    app.set("trust proxy", !__prod__)
    const corsOptions = {origin: ['http://localhost:3000','https://studio.apollographql.com'], credentials: true};
    app.use(cors(corsOptions))

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ 
                client: redis as any,
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
        context: ({req,res}: MyContext): MyContext => ({em, req, res, redis}),
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

