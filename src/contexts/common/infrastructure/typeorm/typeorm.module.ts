import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { UserEntity } from 'src/contexts/user/insfrastructure/persistence/user.entity';
const options: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'skaotico',
    password: process.env.DB_PASS || '123MomiaEs',
    database: process.env.DB_NAME || 'ticket',
    entities: [UserEntity],
    //   synchronize: true, 
};

@Module({
    imports: [TypeOrmModule.forRoot(options)],
    exports: [TypeOrmModule],
})
export class TypeOrmConfigModule { }
