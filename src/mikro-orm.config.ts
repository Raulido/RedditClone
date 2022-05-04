import { __prod__ } from "./constants";
import { Post } from "./entities/post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";

export default {
    migrations:{
        path: path.join(__dirname, "./migrations"),
        glob: '!(*.d).{js,ts}'
    },
    entities: [Post],
    user: 'raul',
    password: 'raulido',
    dbName: 'RedditClone',
    type: 'postgresql',
    debug: !__prod__,   
} as Parameters<typeof MikroORM.init>[0];