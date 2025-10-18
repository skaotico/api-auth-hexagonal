import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { UserHttpModule } from './contexts/user/insfrastructure/http/module/user-http.module';  

async function bootstrap() {

  const app = await NestFactory.create(UserHttpModule);

  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no definidas en DTOs
      forbidNonWhitelisted: true, // lanza error si llegan propiedades no permitidas
      transform: true, // transforma automáticamente los tipos (por ejemplo, string a number)
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`  Application running on http://localhost:${port}`);
}

bootstrap();
