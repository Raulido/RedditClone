import { User } from "../entities/user";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2';
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import {v4} from "uuid";

@ObjectType()
class FieldError{
    @Field()
    field: string;
    @Field()
    message: string;
}
@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[];
    @Field(() => User, {nullable: true})
    user?: User;
}

@Resolver()
export class UserResolver {

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() {redis, em, req}: MyContext
        
    ): Promise<UserResponse> {
        if (newPassword.length <= 3){
            return { errors: [
                {
                    field: 'newPassword',
                    message: 'Length must be greater than 3',
                },
            ]};
        }
        const key = FORGOT_PASSWORD_PREFIX + token
        const userId = await redis.get(key)
        if (!userId){
            return { errors: [
                {
                    field: 'token',
                    message: 'token expired',
                },
            ]};
        }

        const user = await em.findOne(User, {id: parseInt(userId)});

        if (!user){
            return { errors: [
                {
                    field: 'token',
                    message: 'user no longer exists',
                },
            ]};
        }

        user.password = await argon2.hash(newPassword)
        em.persistAndFlush(user);
        redis.del(key)
        // Login after password reset
        req.session.userId = user.id;

        return {user};
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string, 
        @Ctx() {em, redis} : MyContext
    ) {
        const user = await em.findOne(User, {email});
        if (!user){
            return true;
        }
        const token = v4();
        await redis.set(FORGOT_PASSWORD_PREFIX + token, user.id, 'PX', 1000 * 60 * 60 * 24 * 3)
        await sendEmail(
            email,
            `<a href="http://localhost:3000/change-password/${token}"> reset password</a>`
        );
        return true;
    }

    @Query(() => User, {nullable: true})
    async me(
        @Ctx() {req, em}: MyContext
    ){
        if (!req.session.userId){
            return null;
        }
        const user = await em.findOne(User, {id: req.session.userId});
        return user;
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {em, req}: MyContext
    ):Promise<UserResponse>{
        const errors = validateRegister(options);
        if (errors){
            return {errors};
        }
        const hashedPassword = await argon2.hash(options.password)
        const user = em.create(User, { 
            email: options.email,
            username: options.username,
            password: hashedPassword,
        });
        try{
            await em.persistAndFlush(user);
        }catch(err){
            if (err.code === "23505"){//err.detail.includes("already exists")){
                console.log("message: ", err.message)
                return{
                    errors: [{
                        field: "username",
                        message: "username already taken",
                    },
                ],
                };
            }
        }
        req.session.userId = user.id

        return {
            user,
        };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() {em, req}: MyContext
    ):Promise<UserResponse>{
        const user = await em.findOne(User, usernameOrEmail.includes('@') 
            ? {email: usernameOrEmail} 
            : {username: usernameOrEmail}
        );
        if(!user){
            return {
                errors:
                [{
                    field: 'usernameOrEmail',
                    message: 'That username does not exist',
                },
            ],
            };
        }
        const valid = await argon2.verify(user.password, password);
        if(!valid){
            return {
                errors:
                [{
                    field: 'password',
                    message: 'Password is incorrect',
                },
            ],
            };
        }

        req.session.userId = user.id;


        return {
            user,
        };
    }

    @Mutation(() => Boolean)
    logout(@Ctx() {req, res}: MyContext){
        return new Promise((resolve) => 
            req.session.destroy((err) => {
                if (err) {
                    console.log(err);
                    resolve(false);
                    return;
                }
                res.clearCookie(COOKIE_NAME);
                resolve(true);
            })
        );
    }
}

