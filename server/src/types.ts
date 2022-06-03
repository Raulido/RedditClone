import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import {Request, Response} from "express";
import { Session, SessionData } from "express-session";
import { Redis } from "ioredis";

interface ExtendedRequest extends Request {
	session: Session &
		Partial<SessionData> &
		Express.Request & { userId: number };
}

export type MyContext = {
    em: EntityManager<IDatabaseDriver<Connection>>;
    req: ExtendedRequest & {session: Session};
    res: Response;
    redis: Redis;
};