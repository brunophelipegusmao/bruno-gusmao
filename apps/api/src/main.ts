import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { WsAdapter } from '@nestjs/platform-ws';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cors from '@fastify/cors';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
  );

  await app.register(cors, {
    origin: process.env.WEB_URL ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  app.useWebSocketAdapter(new WsAdapter(app));
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Bruno Gusmão — API')
    .setDescription(
      `API do portfólio pessoal de Bruno Gusmão.\n\n` +
      `## Autenticação\n\n` +
      `As rotas protegidas usam sessão via **cookie** (BetterAuth).\n\n` +
      `**Para autenticar no Swagger:**\n` +
      `1. Faça login em \`/login\` no site\n` +
      `2. Abra o DevTools → **Application → Cookies**\n` +
      `3. Copie o valor de \`better-auth.session_token\`\n` +
      `4. Clique em **Authorize** acima e cole o valor no campo **Bearer**\n\n` +
      `## WebSocket — Kanban\n\n` +
      `Conecte em \`ws://localhost:3001\` e envie eventos no formato:\n` +
      `\`\`\`json\n{ "event": "move-card", "data": { "id": "uuid", "type": "task", "to": "in-progress" } }\n\`\`\`\n` +
      `O servidor emite \`card-moved\` para todos os clientes conectados.`,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'BetterAuth session token',
        description:
          'Cole o valor do cookie `better-auth.session_token` obtido após o login.',
      },
      'session',
    )
    .addServer('https://api.brunogusmao.dev', 'Produção')
    .addServer('http://localhost:3001', 'Desenvolvimento local')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Bruno Gusmão API — Docs',
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  logger.log(`API rodando em http://localhost:${port}/api`);
  logger.log(`Docs em http://localhost:${port}/docs`);
}
bootstrap();
