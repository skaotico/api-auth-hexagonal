// domain/entities/User.ts
import { PrimitiveUser, PrimitiveUserCreate } from '../primitive/user.primitive';
import { PrimitiveUserCreateMinimal } from '../primitive/user-find-email-create';

export class User {
    private atributos: PrimitiveUser;

    private constructor(atributos: PrimitiveUser) {
        this.atributos = atributos;
    }

    static create(createUser: PrimitiveUserCreate): User {
        const now = new Date();
        return new User({
            ...createUser,
            id: '0',
            isActive: true,
            deletedAt: null,
            createdAt: now,
            updatedAt: now,
        });
    }


    static fromPrimitives(user: PrimitiveUser): User {
        return new User(user);
    }


    static fromEmail(dto: PrimitiveUserCreateMinimal): User {
        const now = new Date();
        return new User({
            id: '0',
            email: dto.email,
            userName: '',
            pass: '',
            firstName: '',
            lastName: '',
            isActive: true,
            deletedAt: null,
            createdAt: now,
            updatedAt: now,
        });
    }


    update(data: Partial<Omit<PrimitiveUser, 'id' | 'createdAt'>>) {
        Object.assign(this.atributos, data);
        this.atributos.updatedAt = new Date();
    }

    activate() {
        this.atributos.isActive = true;
        this.atributos.updatedAt = new Date();
    }

    deactivate() {
        this.atributos.isActive = false;
        this.atributos.updatedAt = new Date();
    }

    delete() {
        this.atributos.deletedAt = new Date();
        this.atributos.isActive = false;
        this.atributos.updatedAt = new Date();
    }


    toPrimitives(): PrimitiveUser {
        return { ...this.atributos };
    }
}
