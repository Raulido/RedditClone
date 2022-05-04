import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/post";
import mikroConfig from "./mikro-orm.config";

const main = async () => {
    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();
    const em = orm.em.fork();
    const post = em.create(Post,{title: 'Hello World'});
    await em.persistAndFlush(post);
    //console.log('------------sql 2--------------')
    await em.nativeInsert(Post, {title: 'Hello World2'})
    //const posts = await em.find(Post, {})
    //console.log(posts)
};

main().catch(err => {
    //console.log("dirname: ", __dirname)
    console.log(err);
});