import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon from 'argon2'
import { COOKIE_NAME } from "./../constants";

@InputType()
class RegisterInputType {
    @Field()
    username: string;

    @Field()
    password: string;
}

@ObjectType()
class FieldError {
    @Field()
    field: string;
    
    @Field()
    message: string;
}

@ObjectType()
class UserLoginReturn {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[];

    @Field(() => User, {nullable: true})
    user?: User;


}

@Resolver()
export class UserResolver {
    @Query(() => User, {nullable: true})
    async me(
        @Ctx() {em, req}: MyContext
    ) {
        if (!req.session.userId) {
            return null;
        }

        const user = await em.findOne(User, {id: req.session.userId})
        return user
    }

    @Mutation(() => UserLoginReturn)
    async register(
        @Arg("options") options: RegisterInputType,
        @Ctx() {em, req}: MyContext
    ): Promise<UserLoginReturn> {
        if (options.username.length < 3) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "Username's length must be greater than 2"
                    }
                ]
            }
        } else if (options.password.length < 3) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "Password's length must be greater than 2"
                    }
                ]
            }
        }
        const hashedPassword = await argon.hash(options.password)
        const user = em.create(User, {username: options.username, password: hashedPassword})
        try {
            await em.persistAndFlush(user);
        } catch (error) {
            if (error.code === '23505' || error.detail.includes('already exists')) {
                return {
                errors: [
                    {
                        field: "username",
                        message: "Username already exists"
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

    @Mutation(() => UserLoginReturn)
    async login(
        @Arg("options") options: RegisterInputType,
        @Ctx() {em, req}: MyContext
    ): Promise<UserLoginReturn> {
        const user = await em.findOne(User, {username: options.username})
        if (!user) {
            return {
                errors: [
                    {
                    field: "username",
                    message: "User doesn't exist"
                    }
                ]
            }
        }
        const isValid = await argon.verify(user.password, options.password)

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

}