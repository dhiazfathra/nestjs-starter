import { ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ThrottlerStorage } from '@nestjs/throttler';
import { AppModule } from './app.module';
import { CustomScalars } from './common/scalars';
import { AppThrottlerGuard } from './common/guards/throttler.guard';

/**
 * Initializes and starts the NestJS application with global configuration.
 *
 * Sets up CORS, a global route prefix, and a global validation pipe. Reads the server port from configuration or defaults to 3000, then starts listening for incoming requests.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors();

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Apply rate limiting globally
  const reflector = app.get(Reflector);
  // Get the throttler options from the module
  const throttlerOptions = app.get('THROTTLER_OPTIONS');
  const throttlerStorage = app.get(ThrottlerStorage);
  app.useGlobalGuards(
    new AppThrottlerGuard(throttlerOptions, throttlerStorage, reflector),
  );

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('NestJS Starter API')
    .setDescription(
      'API documentation for NestJS Starter project. This API provides authentication, user management, and role-based access control.',
    )
    .setVersion('1.0')
    .addServer('http://localhost:3000', 'Local development server')
    .addServer('https://api.example.com', 'Production server')
    .addTag(
      'auth',
      'Authentication endpoints for login, registration, and profile management',
    )
    .addTag('users', 'User management endpoints with role-based access control')
    .setContact(
      'API Support',
      'https://github.com/dhiazfathra/nestjs-starter',
      'support@example.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Add custom scalar types to schema
  Object.entries(CustomScalars).forEach(([name, schema]) => {
    document.components.schemas[name] = schema;
  });

  // Set up standard Swagger UI
  SwaggerModule.setup('api/docs', app, document);

  // Set up Scalar API Reference
  app.use(
    '/api/reference',
    apiReference({
      // Use the Swagger document we created
      content: document,
      // Use the NestJS theme
      theme: 'nestjs',
      // Pin to a specific version for stability
      cdn: 'https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.25.28',
      // Additional configuration
      layout: 'modern',
      title: 'NestJS Starter API Reference',
      logo: 'https://nestjs.com/img/logo-small.svg',
      favicon: 'https://nestjs.com/img/favicon.png',
    }),
  );

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(
    `Swagger API Documentation available at: http://localhost:${port}/api/docs`,
  );
  console.log(
    `Scalar API Reference available at: http://localhost:${port}/api/reference`,
  );
}
bootstrap();
