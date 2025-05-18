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
  <a href="https://github.com/dhiazfathra/nestjs-starter/actions/workflows/static-analysis.yml">
    <img src="https://github.com/dhiazfathra/nestjs-starter/actions/workflows/static-analysis.yml/badge.svg" alt="Static Analysis" />
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
- 📊 **Bundle Analysis** - Monitor and optimize bundle size with Codecov integration
- ✅ **Validation** - Request validation using class-validator
- 🔄 **Environment Configuration** - Using dotenv and NestJS ConfigModule
- 📚 **API Documentation** - Swagger/OpenAPI and Scalar API Reference
- 📊 **Monitoring** - Grafana and Prometheus for metrics and monitoring
- 🔍 **Distributed Tracing** - Jaeger for request tracing and performance analysis

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- PostgreSQL database
- Docker and Docker Compose (optional, for containerized setup)

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

# Jaeger Configuration
JAEGER_HOST=localhost
JAEGER_PORT=6831
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

## Bundle Analysis

This project includes bundle analysis integration with Codecov to help monitor and optimize your application's bundle size.

### Features

- **Bundle Size Monitoring** - Track bundle size changes over time
- **PR Comments** - Automatic bundle size reports in PR comments
- **Commit Status** - Bundle size information in commit statuses
- **Threshold Alerts** - Configurable warnings for significant bundle size increases

### Usage

Bundle analysis is automatically performed during the CI/CD pipeline. The results are available in:

- Codecov UI under the "Bundles" tab
- PR comments showing bundle size changes
- Commit statuses with bundle size information

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

## Distributed Tracing with Jaeger

This project implements distributed tracing using Jaeger to help monitor and troubleshoot your application, especially in microservices architectures.

### Features

- **Request Tracing** - Track HTTP requests across your application
- **Performance Analysis** - Identify bottlenecks and slow operations
- **Error Tracking** - Visualize where errors occur in the request flow
- **Dependency Visualization** - See how services interact with each other

### Implementation

The distributed tracing system is implemented using:

- `@opentelemetry/api` - OpenTelemetry API for instrumentation
- `@opentelemetry/sdk-node` - OpenTelemetry SDK for Node.js
- `@opentelemetry/auto-instrumentations-node` - Auto-instrumentation for Node.js
- `@opentelemetry/exporter-jaeger` - Jaeger exporter for OpenTelemetry

### Usage

Jaeger UI is available at:

```
http://localhost:16686
```

The Jaeger UI provides:

- Search for traces based on service, operation, tags, and duration
- Detailed trace view with span information
- Dependency graphs showing service interactions
- Comparison of multiple traces

### Endpoints

- `GET /api/tracing` - Get information about the tracing setup

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
│   ├── tracing/         # Distributed tracing with Jaeger
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

## Docker Setup

This project includes Docker support for easy deployment and development.

### Requirements

- Docker version 20.10.0 or higher
- Docker Compose V2 (2.0.0 or higher)

Older versions may cause compatibility issues with the healthchecks and Docker Compose commands used in this project.

### Using Docker Compose

This project uses Docker Compose to manage multiple services (NestJS app, PostgreSQL, and Redis). The commands below use Docker Compose V2 syntax (without hyphen):

```bash
# Start all services (app, database, and Redis)
$ docker compose up -d

# Start all services (app, database, and Redis) for Apple Silicon (M1/M2/M3)
$ docker compose -f docker-compose.arm64.yaml up -d

# View logs
$ docker compose logs -f

# Stop all services
$ docker compose down

# Rebuild containers after making changes to Dockerfile
$ docker compose up -d --build

# Check application health
$ curl http://localhost:3000/api/health
```

### Health Check

The application includes a health check endpoint at `/api/health` that returns a status object:

```json
{
  "status": "ok",
  "timestamp": "<ISO8601_timestamp>"
}
```

This endpoint is used by the Docker validation workflow to verify that the application is functioning correctly.

### Environment Variables for Docker

When using Docker, you can configure these additional environment variables in your `.env` file:

```env
# PostgreSQL Docker Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=nestjs

# Redis Configuration
# For Docker environment, use the service name
REDIS_HOST=redis  # Use 'localhost' for local development

# Jaeger Configuration
# For Docker environment, use the service name
JAEGER_HOST=jaeger  # Use 'localhost' for local development
JAEGER_PORT=6831
```

### Apple Silicon Support

This project includes a dedicated Docker Compose file optimized for Apple Silicon (M1/M2/M3) ARM64 architecture:

- **Optimized Images**: Uses ARM64-compatible images for all services
- **Native Performance**: Runs natively on ARM64 architecture without emulation
- **Platform Specification**: Explicitly sets the platform for each service

To use the ARM64-optimized setup:

```bash
# Start all services optimized for Apple Silicon
$ docker compose -f docker-compose.arm64.yaml up -d
```

This approach provides better performance than using the platform flag with the standard Docker Compose file.

### Building the Docker Image Separately

This project uses a multi-stage Docker build process for optimized production images:

1. **Builder Stage**: Installs dependencies, generates Prisma client, builds the application, and prunes development dependencies
2. **Production Stage**: Creates a minimal production image with only the necessary runtime files

This approach significantly reduces the final image size and improves security by excluding development dependencies and build tools from the production environment.

```bash
# Build the image
$ docker build -t nestjs-starter .

# Run the container
$ docker run -p 3000:3000 --env-file .env nestjs-starter
```

## Testing GitHub Actions Locally

This project includes several GitHub Actions workflows for CI/CD. You can test these workflows locally using [Act](https://github.com/nektos/act), a tool that runs GitHub Actions locally using Docker.

### Prerequisites

- Docker installed and running
- [Act](https://github.com/nektos/act) installed (`brew install act` on macOS)

### Running Workflows Locally

```bash
# List all available workflows
$ act -l

# Run the Docker validation workflow
$ act -j validate-docker-compose --container-architecture linux/amd64

# Run a specific job with verbose output
$ act -j validate-docker-compose -v

# Run a workflow with specific event
$ act push
```

### Troubleshooting Act

- If you're using Apple Silicon (M1/M2/M3), add `--container-architecture linux/amd64` to avoid platform compatibility issues
- Use `-v` flag for verbose output to debug issues
- Check container logs with `docker logs` if a job fails

## Monitoring with Grafana and Prometheus

This project includes a comprehensive monitoring setup using Grafana and Prometheus, providing real-time insights into application performance and health.

### Features

- **Real-time Metrics**: Monitor HTTP request rates, response times, memory usage, and CPU utilization
- **Pre-configured Dashboards**: Ready-to-use Grafana dashboards for NestJS applications
- **Automatic Service Discovery**: Prometheus automatically discovers and monitors services
- **Health Checks**: Integrated health endpoints for monitoring application and database status

### Accessing Monitoring Tools

- **Prometheus**: Available at http://localhost:9090 when running with Docker Compose
- **Grafana**: Available at http://localhost:3001 when running with Docker Compose
  - Default credentials: admin/admin

### Custom Metrics

The application exposes custom metrics through the `/metrics` endpoint, which Prometheus scrapes at regular intervals. Key metrics include:

- HTTP request counts by endpoint and status code
- Request duration histograms
- In-progress request counts
- Node.js runtime metrics (memory, CPU, event loop)

### Adding Custom Dashboards

To add custom Grafana dashboards:

1. Create a JSON dashboard definition in `monitoring/grafana/provisioning/dashboards/`
2. Update the dashboard configuration in `monitoring/grafana/provisioning/dashboards/dashboards.yml`
3. Restart the Grafana container

## License

This project is [MIT licensed](LICENSE).
