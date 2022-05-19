import { RegisterInputType } from "./RegisterInputType"
import { FieldError } from "./UserType"

export const validateRegister = (options: RegisterInputType) => {
    let errors: FieldError[] = []
    if (options.username.length < 3) {
        errors.push(
                {
                    field: "username",
                    message: "Username's length must be greater than 2"
                }
            )
        
    }
    if (options.username.includes("@")) {
        errors.push(
                {
                    field: "username",
                    message: "Cannot include @ in username"
                }
            )
        
    }
    if (!options.email.includes("@")) {
            errors.push(
                {
                    field: "email",
                    message: "Invalid email"
                }
            )
        
    }
    if (options.password.length < 3) {
        errors.push(
                {
                    field: "password",
                    message: "Password's length must be greater than 2"
                }
            )
    }

    return errors.length ? errors : undefined;
}