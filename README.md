# NestJS Starter Project

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  <a href="https://github.com/dhiazfathra/nestjs-starter/actions/workflows/test.yml">
    <img src="https://github.com/dhiazfathra/nestjs-starter/actions/workflows/test.yml/badge.svg" alt="Tests" />
  </a>
  <a href="https://codecov.io/gh/dhiazfathra/nestjs-starter">
    <img src="https://codecov.io/gh/dhiazfathra/nestjs-starter/graph/badge.svg" alt="Coverage" />
  </a>
  <a href="https://github.com/dhiazfathra/nestjs-starter/actions/workflows/semantic-release.yml">
    <img src="https://github.com/dhiazfathra/nestjs-starter/actions/workflows/semantic-release.yml/badge.svg" alt="Semantic Release" />
  </a>
</p>

## Description

A NestJS TypeScript starter project with user authentication, following best practices, DRY and SOLID principles. This project provides a solid foundation for building secure and scalable backend applications.

## Features

- 🔐 **Authentication** - JWT-based authentication system
- 👤 **User Management** - Complete CRUD operations for users
- 🔑 **Role-Based Access Control** - User and Admin roles with proper guards
- 🗃️ **Database Integration** - PostgreSQL with Prisma ORM
- 🚀 **Redis Caching** - Performance optimization with Redis-based caching
- ✅ **Validation** - Request validation using class-validator
- 🔄 **Environment Configuration** - Using dotenv and NestJS ConfigModule
- 📚 **API Documentation** - Swagger/OpenAPI and Scalar API Reference

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- PostgreSQL database

## Installation

```bash
# Install dependencies
$ npm install

# Generate Prisma client
$ npx prisma generate

# Run database migrations
$ npx prisma migrate dev --name init
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/dbname?schema=public"

# JWT Configuration
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRATION="1d"

# Application
PORT=3000

# Redis Cache Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=300
```

## Running the app

```bash
# Development mode
$ npm run start

# Watch mode (recommended for development)
$ npm run start:dev

# Production mode
$ npm run start:prod
```

## API Documentation

The API is documented using Swagger/OpenAPI with two different interfaces:

### Standard Swagger UI

When the application is running, you can access the standard Swagger UI at:

```
http://localhost:3000/api/docs
```

### Scalar API Reference

A beautiful, modern API reference powered by Scalar is available at:

```
http://localhost:3000/api/reference
```

The Scalar API Reference provides a more user-friendly and visually appealing interface for exploring the API.

Both documentation interfaces include:

- Interactive API explorer
- Request/response schemas with examples
- Authentication requirements
- Custom scalar types for consistent data representation

### Scalar Types

The API uses the following scalar types for consistent data representation:

- **UUID** - For entity IDs (format: uuid)
- **Date** - For timestamps (format: date-time, ISO8601)
- **Email** - For email addresses (format: email)
- **Password** - For password fields (format: password)

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get access token
- `GET /api/auth/profile` - Get current user profile (requires authentication)

#### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (authenticated users)
- `PATCH /api/users/:id` - Update user (authenticated users)
- `DELETE /api/users/:id` - Delete user (admin only)

## Redis Caching

This project implements Redis caching to improve performance and reduce database load. The caching system is designed to be transparent and easy to use throughout the application.

### Features

- **Transparent Caching** - Data is automatically cached and invalidated when needed
- **Configurable TTL** - Cache expiration times are configurable via environment variables
- **Cache Invalidation** - Automatic cache invalidation on data updates/deletes
- **Centralized Service** - A dedicated CacheService for all caching operations

### Implementation

The caching system is implemented using:

- `@nestjs/cache-manager` - NestJS cache manager module
- `cache-manager` - Flexible cache manager
- `cache-manager-redis-store` - Redis store for cache-manager
- `redis` - Redis client for Node.js

### Usage

The CacheService provides the following methods:

```typescript
// Get a value from cache
const value = await cacheService.get<T>(key);

// Set a value in cache
await cacheService.set(key, value, ttl);

// Delete a value from cache
await cacheService.del(key);

// Get a value from cache or compute it if not found
const value = await cacheService.getOrSet(
  key,
  async () => computeValue(),
  ttl
);
```

## Project Structure

```
├── prisma/              # Prisma schema and migrations
├── src/
│   ├── auth/            # Authentication module
│   │   ├── decorators/  # Custom decorators
│   │   ├── dto/         # Data transfer objects
│   │   ├── guards/      # Authentication guards
│   │   └── strategies/  # Passport strategies
│   ├── cache/           # Redis caching module
│   ├── common/          # Shared resources
│   │   ├── enums/       # Enumerations
│   │   └── scalars/     # Custom scalar types for API docs
│   ├── prisma/          # Prisma service
│   ├── users/           # Users module
│   │   ├── dto/         # Data transfer objects
│   │   └── entities/    # Entity definitions for API docs
│   ├── app.module.ts    # Main application module
│   └── main.ts          # Application entry point
└── test/                # Test files
```

## Testing

```bash
# Unit tests
$ npm run test

# Watch mode for tests
$ npm run test:watch

# Test coverage
$ npm run test:cov

# Test with JUnit XML output for test analytics
$ npm run test:junit

# E2E tests
$ npm run test:e2e
```

## Test Analytics

This project is configured with Codecov Test Analytics to provide insights into test performance and reliability:

- Overview of test run times and failure rates across branches
- Identification of failed tests in PR comments with stack traces for easier debugging
- Detection of flaky tests that fail intermittently

Test results are automatically uploaded to Codecov during CI runs via GitHub Actions. The workflow generates JUnit XML test reports and uploads them alongside coverage reports using the Codecov Test Results Action.

## License

This project is [MIT licensed](LICENSE).
