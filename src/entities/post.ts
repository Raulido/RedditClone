import { Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Post{
  [OptionalProps]?: 'createdAt' | 'updatedAt';
  
  @PrimaryKey()
  id!: number;

  @Property({type: 'date', defaultRaw: 'now()'})
  createdAt!: Date;

  @Property({type: 'date', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt!: Date;

  @Property({type: 'text'})
  title!: string;
}