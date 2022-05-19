import { Field, InputType } from "type-graphql";


@InputType()
export class RegisterInputType {
    @Field()
    email: string;

    @Field()
    username: string;

    @Field()
    password: string;
}
