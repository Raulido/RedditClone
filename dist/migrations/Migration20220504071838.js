"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20220504071838 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20220504071838 extends migrations_1.Migration {
    async up() {
        this.addSql('create table "post" ("id" serial primary key, "created_at" timestamptz(0) not null default now(), "updated_at" timestamptz(0) not null default now(), "title" text not null);');
    }
    async down() {
        this.addSql('drop table if exists "post" cascade;');
    }
}
exports.Migration20220504071838 = Migration20220504071838;
//# sourceMappingURL=Migration20220504071838.js.map