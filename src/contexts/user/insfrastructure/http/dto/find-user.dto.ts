import { IsEmail, IsNotEmpty } from 'class-validator';

export class FindUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}