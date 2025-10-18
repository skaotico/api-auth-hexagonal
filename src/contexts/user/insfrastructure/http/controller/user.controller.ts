import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { FindUserUseCase } from 'src/contexts/user/application/findUserUseCase/useCase/find-user-use-case';
import { FindUserDto } from '../dto/find-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly findUserUseCase: FindUserUseCase) {}

  // GET /users/find?email=algo@correo.com
  @Get('find')
  async findUser(@Query() query: FindUserDto) {
    try {
      const result = await this.findUserUseCase.execute(query);
      return result;  
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}