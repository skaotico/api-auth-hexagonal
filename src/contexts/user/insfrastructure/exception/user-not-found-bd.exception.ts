export class UserNotFoundBdException extends Error {
    constructor(email: string) {
        super(`Usuario con email ${email} no encontrado`);
        this.name = 'UserNotFoundException';
    }
}