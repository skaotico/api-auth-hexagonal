import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { UserHttpModule } from './contexts/user/insfrastructure/http/module/user-http.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
async function bootstrap() {

  const app = await NestFactory.create(UserHttpModule);
  const configService = app.get(ConfigService);

  const swaggerConfig = new DocumentBuilder()
    .setTitle(configService.get<string>('API_NAME')!)
    .setDescription(configService.get<string>('API_DESCRIPTION')!)
    .setVersion(configService.get<string>('API_VERSION')!)
    .addBearerAuth()
    .build();


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no definidas en DTOs
      forbidNonWhitelisted: true, // lanza error si llegan propiedades no permitidas
      transform: true, // transforma automáticamente los tipos (por ejemplo, string a number)
    }),
  );
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  fs.writeFileSync('./openapi.json', JSON.stringify(document, null, 2));

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`  Application running on http://localhost:${port}`);
}

bootstrap();
