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




const main = async () => {
    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();
    const em = orm.em.fork();
    // const post = em.create(Post,{title: 'Hello World'});
    // await em.persistAndFlush(post);
    // console.log('------------sql 2--------------')
    // await em.nativeInsert(Post, {title: 'Hello World2'})
    // const posts = await em.find(Post, {})
    // console.log(posts)
    
    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = createClient({ legacyMode: true });
    redisClient.connect().catch(console.error)
    app.set("trust proxy", !__prod__)
    app.use(
        session({
            name: 'raul',
            store: new RedisStore({ 
                client: redisClient as any,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
                httpOnly: true,
                secure: true,
                sameSite: 'none',
            },
            saveUninitialized: false,
            secret: "asdp0fimasdv",
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({req,res}: MyContext): MyContext => ({em, req, res})
    });
    // app.get('/', (_,res) => { 
    //     res.send("hello");
    // });
    await apolloServer.start();
    const corsOptions = {origin: 'https://studio.apollographql.com', credentials: true}
    // app.set("trust proxy", !process.env.NODE_ENV === "production");
    apolloServer.applyMiddleware({app,cors: corsOptions});
    app.listen(4000, () => { 
        console.log('server started on localhost:4000')
    });
    
};

main().catch(err => {
    //console.log("dirname: ", __dirname)
    console.log(err);
});