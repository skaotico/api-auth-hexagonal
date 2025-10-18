import { UserRepository } from "src/contexts/user/domain/repository/user.repository";
import { FindUserDto } from "../dto/find-user.request.dto";
import { User } from "../../../domain/entities/user";
import { PrimitiveUser } from "../../../domain/primitive/user.primitive";

export class FindUserUseCase {

    constructor(private readonly userRepository: UserRepository) {

    }

    async execute(findUserDto: FindUserDto): Promise<{ user: PrimitiveUser }> {

        const userDomain = await this.userRepository.findByEmail(
            User.fromEmail({ email: findUserDto.email })
        );

        if (!userDomain) {
            throw new Error("Usuario no encontrado.");
        }




        return { user: userDomain.toPrimitives() };

    }
}