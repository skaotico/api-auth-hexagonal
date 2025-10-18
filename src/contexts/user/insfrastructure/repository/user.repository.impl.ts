
import { Injectable } from 'src/contexts/common/dependencyInjection/injectable';
import { User } from '../../domain/entities/user';
import { Repository } from 'typeorm';
import { UserRepository } from '../../domain/repository/user.repository';
import { UserEntity } from '../persistence/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserNotFoundBdException } from '../exception/user-not-found-bd.exception';

@Injectable()
export class IUserRepository extends UserRepository {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repository: Repository<UserEntity>,
    ) {
        super();
    }

    async findByEmail(user: User): Promise<User> {
        const email = user.toPrimitives().email;
        const entity = await this.repository.findOne({ where: { email } });
        if (!entity) throw new UserNotFoundBdException(email);
        return User.fromPrimitives({
            id: entity.id,
            email: entity.email,
            userName: entity.userName,
            pass: entity.pass,
            firstName: entity.firstName,
            lastName: entity.lastName,
            isActive: entity.isActive,
            deletedAt: entity.deletedAt ?? null,
            updatedAt: entity.updatedAt,
            createdAt: entity.createdAt,
        });

    }


}
