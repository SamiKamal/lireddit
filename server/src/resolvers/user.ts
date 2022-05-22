import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import argon from 'argon2'
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "./../constants";
import { RegisterInputType } from "../utils/RegisterInputType";
import { validateRegister } from "../utils/validateRegister";
import { UserReturnType } from "../utils/UserType";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from 'uuid'
import { conn } from "../index";

@Resolver()
export class UserResolver {
    @Query(() => User, {nullable: true})
    async me(
        @Ctx() {req}: MyContext
    ) {
        if (!req.session.userId) {
            return null;
        }

        return await User.findOneBy({id: req.session.userId})
    }

    @Mutation(() => UserReturnType)
    async register(
        @Arg("options") options: RegisterInputType,
        @Ctx() { req}: MyContext
    ): Promise<UserReturnType> {
        const errors = validateRegister(options);
        if (errors) {
            return {
                errors
            }
        }

        
        const hashedPassword = await argon.hash(options.password)
        let user;
        try {
            user = await conn
            .createQueryBuilder()
            .insert()
            .into(User)
            .values({
                username: options.username,
                email: options.email,
                password: hashedPassword,
            })
            .returning("*")
            .execute();

            user = user.raw[0]

            
        } catch (error) {
            if (error.code === '23505' || error.detail.includes('already exists')) {
                return {
                errors: [
                    {
                        field: "username",
                        message: "Username or email already exists"
                    }
                ]
            }
            }
        }

        // login user
        req.session.userId = user.id

        return {
            user
        }
    }

    @Mutation(() => UserReturnType)
    async login(
        @Arg("usernameOrEmail") usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() {req}: MyContext
    ): Promise<UserReturnType> {
        const user = await User.findOneBy({[usernameOrEmail.includes("@") ? "email" : "username"]: usernameOrEmail})
        if (!user) {
            return {
                errors: [
                    {
                    field: "usernameOrEmail",
                    message: "User doesn't exist"
                    }
                ]
            }
        }
        const isValid = await argon.verify(user.password, password)

        if (!isValid) {
            return {
                errors: [
                    {
                    field: "password",
                    message: "Password is incorrect"
                    }
                ]
            }
        }

        req.session.userId = user.id
        return {
            user
        }
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() {req, res}: MyContext
    ): Promise<Boolean> {
        return new Promise((resolve) => req.session.destroy(err => {            
            if (err) {
                console.log(err);
                resolve(false)
                return
            };
            res.clearCookie(COOKIE_NAME)
            resolve(true)
        }))
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email") email: string,
        @Ctx() {redis}: MyContext
    ) {
        const user = await User.findOneBy({email})

        if (!user) {
            return true
        }

        const token = v4()
        await redis.set(
            FORGOT_PASSWORD_PREFIX + token,
             user.id,
             'EX',
              1000 * 60 * 60 * 24)
        sendEmail(email, `<a href="http://localhost:3000/change-password/${token}">reset password</a>`);
        return true;
    }

    @Mutation(() => UserReturnType)
    async changePassword(
        @Arg("token") token: string,
        @Arg("password") password: string,
        @Ctx() {redis, req}: MyContext
    ): Promise<UserReturnType> {

        if (password.length < 3) {
            return {
                    errors: [{
                        field: "newPassword",
                        message: "Password's length must be greater than 2"
                    }]
            }
        }
        // get user id from redis
        const key = FORGOT_PASSWORD_PREFIX + token
        const userId = await redis.get(key)

        if (!userId) {
            return {
                    errors: [{
                        field: "token",
                        message: "Token expired"
                    }]
            }
        }
        // get the user using user id
        const id = parseInt(userId as string);
        const user = await User.findOneBy({id: id})

        if (!user) {
            return {
                errors: [{
                    field: "token",
                    message: "user no longer exist"
                }]
            }
        }
        // hash password and save it
        await User.update(
            {id},
            {
                password : await argon.hash(password)
            }
        );


        redis.del(key)
        // log in user
        req.session.userId = userId

        return {
            user
        };
    }


}