 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '../controller/user.controller';
import { IUserRepository } from '../../repository/user.repository.impl';
import { UserEntity } from '../../persistence/user.entity';
import { FindUserUseCase } from '../../../application/findUserUseCase/useCase/find-user-use-case';
import { TypeOrmConfigModule } from 'src/contexts/common/infrastructure/typeorm/typeorm.module';

@Module({
  imports: [TypeOrmConfigModule,TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [
    IUserRepository,  
    {
      provide: FindUserUseCase,  
      useFactory: (userRepo: IUserRepository) => new FindUserUseCase(userRepo),
      inject: [IUserRepository],
    },
  ],
})
export class UserHttpModule {}
