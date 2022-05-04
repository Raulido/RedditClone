"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mikro-orm/core");
const post_1 = require("./entities/post");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const main = async () => {
    const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
    await orm.getMigrator().up();
    const em = orm.em.fork();
    const post = em.create(post_1.Post, { title: 'Hello World' });
    await em.persistAndFlush(post);
    await em.nativeInsert(post_1.Post, { title: 'Hello World2' });
};
main().catch(err => {
    console.log(err);
});
//# sourceMappingURL=index.js.map