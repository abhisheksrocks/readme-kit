# readme-kit

> A lightweight Node.js/TypeScript health check server built with Fastify, providing a simple `/status` endpoint for monitoring and liveness probes.

[![Node.js](https://img.shields.io/badge/Node.js-20.0.0+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.6.1-black.svg)](https://www.fastify.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

readme-kit is a production-ready health check server designed for containerized environments. It provides a simple HTTP endpoint that returns the operational status of the service without requiring any external dependencies or databases. The server is built following Clean Architecture principles, making it maintainable, testable, and extensible.

### Key Features

- **Zero Dependencies**: Starts immediately without requiring databases or external services
- **Liveness Check**: Purpose-built `/status` endpoint for container orchestration platforms
- **Docker-Ready**: Fully containerized deployment with multi-stage builds
- **Type-Safe**: Built with TypeScript for enhanced code quality and developer experience
- **High Performance**: Powered by Fastify for optimal request handling
- **Production-Tested**: Comprehensive test suite with 80%+ coverage requirements
- **Clean Architecture**: Organized codebase following domain-driven design principles

### Use Cases

- Kubernetes liveness probes
- Docker health checks
- Load balancer health monitoring
- Uptime monitoring services
- Container orchestration platforms

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Docker Deployment](#docker-deployment)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

Before getting started, ensure you have the following installed:

### Required

- **Node.js**: ≥20.0.0 LTS ([Download](https://nodejs.org/))
  ```bash
  node --version  # Should output v20.x.x or higher
  ```

- **npm**: ≥10.0.0
  ```bash
  npm --version   # Should output 10.x.x or higher
  ```

### Optional (for containerized deployment)

- **Docker**: Latest version ([Download](https://www.docker.com/))
  ```bash
  docker --version
  ```

- **Docker Compose**: Latest version
  ```bash
  docker-compose --version
  ```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/readme-kit.git
cd readme-kit
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment (Optional)

Create a `.env` file for custom configuration:

```bash
cat > .env << EOF
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
EOF
```

**Note**: The server uses fixed port 3000 by default, but environment variables provide flexibility for different deployment scenarios.

## Development Workflow

### Build the Project

Compile TypeScript to JavaScript:

```bash
npm run build
```

The compiled output will be in the `dist/` directory with the following structure:

```
dist/
├── domain/
├── application/
├── infrastructure/
├── shared/
└── main.js
```

### Run in Development Mode

Start the server with hot-reload (if configured):

```bash
npm run dev
```

Or run the compiled code:

```bash
npm start
```

Expected console output:

```
Server listening on http://0.0.0.0:3000
```

### Verify Server is Running

Open a new terminal and test the health endpoint:

```bash
# Basic test
curl http://localhost:3000/status

# Expected response:
# {"status":"ok"}

# Test with headers
curl -i http://localhost:3000/status

# Expected response:
# HTTP/1.1 200 OK
# content-type: application/json; charset=utf-8
# content-length: 15
#
# {"status":"ok"}
```

## Testing

### Run All Tests

Execute the complete test suite:

```bash
npm test
```

### Run Tests with Coverage

Generate and view coverage reports:

```bash
# Generate coverage report
npm run test:coverage

# View coverage summary in terminal
# Full HTML report available in coverage/index.html
```

**Coverage Requirements** (must meet or exceed):
- Lines: ≥80%
- Functions: ≥80%
- Branches: ≥80%
- Statements: ≥80%

### Run Specific Test Suites

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e

# Contract tests (specific file)
npm run test -- health.routes.test.ts
```

### Watch Mode (Development)

Run tests in watch mode with automatic re-runs on file changes:

```bash
npm run test:watch
```

## Docker Deployment

### Build Docker Image

Build the production-ready Docker image:

```bash
docker build -t readme-kit:latest .
```

Verify the image was created:

```bash
docker images | grep readme-kit
```

### Run Docker Container

Start the container:

```bash
docker run -d \
  --name readme-kit-server \
  -p 3000:3000 \
  readme-kit:latest
```

Verify the container is running:

```bash
docker ps | grep readme-kit-server
```

### Test Dockerized Service

```bash
# Test health endpoint
curl http://localhost:3000/status

# Expected response:
# {"status":"ok"}

# Check container logs
docker logs readme-kit-server

# Stop container
docker stop readme-kit-server

# Remove container
docker rm readme-kit-server
```

### Using Docker Compose

For simplified orchestration:

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Test endpoint
curl http://localhost:3000/status

# Stop services
docker-compose down
```

### Docker Health Check

The Dockerfile includes a built-in health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/status', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
```

Check the health status:

```bash
docker inspect --format='{{.State.Health.Status}}' readme-kit-server
# Expected: "healthy" after startup period
```

## Architecture

readme-kit follows **Clean Architecture** principles, ensuring separation of concerns and maintainability:

### Project Structure

```
readme-kit/
├── src/
│   ├── domain/              # Business logic and entities
│   ├── application/         # Use cases and application services
│   ├── infrastructure/      # External interfaces (HTTP, DB, etc.)
│   ├── shared/             # Shared utilities and types
│   └── main.ts             # Application entry point
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/               # End-to-end tests
├── specs/                  # Feature specifications and documentation
├── Dockerfile             # Multi-stage Docker build
├── docker-compose.yml     # Container orchestration
└── package.json          # Project dependencies
```

### Design Principles

- **Domain-Driven Design**: Core business logic isolated from infrastructure concerns
- **Dependency Inversion**: High-level modules independent of low-level implementations
- **Single Responsibility**: Each module has a single, well-defined purpose
- **Testability**: Architecture supports comprehensive unit and integration testing

### Technology Stack

- **Runtime**: Node.js 20.0.0+ LTS
- **Language**: TypeScript 5.5.0+
- **Web Framework**: Fastify 5.6.1
- **Testing**: Vitest 3.2+
- **Containerization**: Docker + Docker Compose

## API Documentation

### Endpoint: GET /status

Returns the health status of the service.

**Request**:
```http
GET /status HTTP/1.1
Host: localhost:3000
```

**Response**:
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"status":"ok"}
```

### Endpoint Specifications

- **URL**: `/status`
- **Method**: `GET`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: `{"status":"ok"}`
- **Error Responses**:
  - **Code**: 405 Method Not Allowed (for non-GET requests)
  - **Content**: `{"statusCode":405,"error":"Method Not Allowed","message":"GET method required for /status endpoint"}`

### OpenAPI Specification

Complete API documentation is available in the [OpenAPI 3.1.0 specification](specs/001-create-basic-server/contracts/openapi.yaml).

View the interactive API docs by running:

```bash
# Install Swagger UI (optional)
npx @redocly/cli preview-docs specs/001-create-basic-server/contracts/openapi.yaml
```

### Endpoint Behavior

- Always returns 200 OK when the service is operational
- Ignores all query parameters and headers
- No authentication required
- No rate limiting
- No request logging for `/status` endpoint
- Liveness check only (no external dependency validation)

## Configuration

### Environment Variables

The server can be configured using the following environment variables:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | HTTP port to listen on | `3000` | No |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` | No |
| `HOST` | Host address to bind to | `0.0.0.0` | No |

### Example Configuration

**Development**:
```bash
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
```

**Production**:
```bash
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
```

**Docker**:
```bash
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
```

## Contributing

We welcome contributions! Please follow these guidelines:

### Development Process

1. **Fork the repository** and create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the project's coding standards:
   - Write TypeScript with strict type checking
   - Follow Clean Architecture principles
   - Add tests for new functionality
   - Maintain 80%+ code coverage

3. **Run tests** and ensure they pass:
   ```bash
   npm run build
   npm test
   npm run test:coverage
   ```

4. **Commit your changes** with descriptive messages:
   ```bash
   git commit -m "feat: add new feature description"
   ```

5. **Push to your fork** and create a pull request:
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style

- Follow standard TypeScript conventions
- Use ESLint and Prettier for code formatting
- Write clear, descriptive variable and function names
- Document complex logic with comments
- Keep functions small and focused

### Testing Requirements

- All new features must include tests
- Maintain minimum 80% coverage across all metrics
- Include unit, integration, and E2E tests where applicable
- Test edge cases and error conditions

### Pull Request Process

1. Update documentation for any new features
2. Ensure all tests pass and coverage requirements are met
3. Request review from maintainers
4. Address any feedback or requested changes
5. Merge after approval

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 readme-kit contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Support & Resources

### Documentation

- [Feature Specification](specs/001-create-basic-server/spec.md) - Detailed feature requirements
- [Implementation Plan](specs/001-create-basic-server/plan.md) - Technical implementation details
- [API Contracts](specs/001-create-basic-server/contracts/openapi.yaml) - OpenAPI specification
- [Quickstart Guide](specs/001-create-basic-server/quickstart.md) - Step-by-step setup instructions

### Kubernetes Integration

Example Kubernetes liveness probe configuration:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: readme-kit
spec:
  containers:
  - name: app
    image: readme-kit:latest
    ports:
    - containerPort: 3000
    livenessProbe:
      httpGet:
        path: /status
        port: 3000
      initialDelaySeconds: 10
      periodSeconds: 10
      timeoutSeconds: 2
      failureThreshold: 3
```

### Troubleshooting

**Port Already in Use**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

**Tests Failing**:
```bash
# Rebuild and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Docker Build Issues**:
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Verify Docker multi-stage build
docker history readme-kit:latest
```

---

**Built with ❤️ using Node.js, TypeScript, and Fastify**
