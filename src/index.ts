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

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: () => ({em})
    });
    // app.get('/', (_,res) => { 
    //     res.send("hello");
    // });
    await apolloServer.start();
    apolloServer.applyMiddleware({app});
    app.listen(4000, () => { 
        console.log('server started on localhost:4000')
    });
    
};

main().catch(err => {
    //console.log("dirname: ", __dirname)
    console.log(err);
});