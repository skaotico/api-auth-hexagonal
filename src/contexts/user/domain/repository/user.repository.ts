import { User } from "../entities/user";
import { PrimitiveUserCreateMinimal } from "../primitive/user-find-email-create";

export abstract class UserRepository{

    abstract   findByEmail(user:User):Promise<User>
}