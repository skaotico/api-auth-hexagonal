export class UserNotFoundException extends Error{

    constructor(public readonly email:string){
        super('usuario no encontrado por el email :  '+email)
    }   
}