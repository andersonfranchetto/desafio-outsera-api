import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as packageJson from '../package.json';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'node:fs';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Bootstrap da aplicação.
 */
async function bootstrap() {
  /**
   * Obtém ambiente de execução.
   */
  const environment = process.env.NODE_ENV || 'development';

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  /**
   * Configura documentação da API com Swagger.
   */
  const config = new DocumentBuilder()
    .setTitle('Golden Raspberry Awards API.')
    .setDescription('API that provide by Anderson Franchetto')
    .setVersion(packageJson.version)
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const outputPath = join(process.cwd(), 'swagger-spec.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));

  SwaggerModule.setup('api/docs', app, document);

  /**
   *
   * Inicia o servidor na porta especificada, exibindo uma mensagem de depuração no ambiente de dev.
   */
  await app.listen(port, '0.0.0.0');

  if (environment === 'development') {
    const swaggerUrl = `http://localhost:${port}/api/docs`;

    Logger.debug(
      `🚀 The server is listening on port ${port} ⭐ ⭐ ⭐`,
      String(environment).charAt(0).toUpperCase().concat(environment.slice(1)),
    );
    Logger.debug(
      `📚 Swagger documentation is available at ${swaggerUrl}`,
      String(environment).charAt(0).toUpperCase().concat(environment.slice(1)),
    );
  }
}

bootstrap();
