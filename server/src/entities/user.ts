import { Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User{
  [OptionalProps]?: 'createdAt' | 'updatedAt';
  
  @Field()
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({type: 'date', defaultRaw: 'now()'})
  createdAt!: Date;

  @Field(() => String)
  @Property({type: 'date', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt!: Date;

  //Can remove field to prevent schema exposure on graphQL
  @Field()
  @Property({type: 'text', unique: true})
  username!: string;

  @Property({type: 'text'})
  password!: string;
}