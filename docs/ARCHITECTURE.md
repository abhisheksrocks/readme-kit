# Architecture Documentation

**Project**: readme-kit
**Version**: 1.0.0
**Last Updated**: 2025-10-05
**Based on**: Feature 001-create-basic-server

## Table of Contents

1. [Overview](#overview)
2. [Clean Architecture Layers](#clean-architecture-layers)
3. [Folder Structure](#folder-structure)
4. [Data Flow](#data-flow)
5. [Dependency Direction](#dependency-direction)
6. [Technology Stack](#technology-stack)
7. [Design Principles](#design-principles)
8. [Testing Strategy](#testing-strategy)

---

## Overview

The readme-kit backend is built using **Clean Architecture** principles, ensuring a clear separation of concerns, framework independence, and high testability. The architecture consists of three primary layers: **Domain**, **Application**, and **Infrastructure**, with dependencies flowing inward toward the domain layer.

This architecture is designed to be:
- **Framework-agnostic**: Business logic remains independent of Fastify or any other framework
- **Testable**: Each layer can be tested in isolation with minimal dependencies
- **Maintainable**: Clear boundaries between layers make changes predictable and safe
- **Scalable**: New features can be added without disrupting existing code

---

## Clean Architecture Layers

### 1. Domain Layer (Enterprise Business Rules)

**Location**: `src/domain/`

**Purpose**: Contains the core business entities, value objects, and domain logic that are completely independent of any framework, database, or external service.

**Components**:
- **Entities**: Core business objects with identity (e.g., user accounts, documents)
- **Value Objects**: Immutable objects defined by their attributes (e.g., `HealthStatus`)
- **Repository Interfaces**: Contracts for data persistence (implemented in infrastructure layer)
- **Domain Events**: Business events that trigger side effects
- **Domain Errors**: Business-specific exceptions and error types

**Rules**:
- No dependencies on outer layers
- No framework-specific code
- Pure TypeScript/JavaScript business logic
- Immutable where possible

**Example**:
```typescript
// src/domain/value-objects/health-status.vo.ts
export class HealthStatus {
  private readonly _value: 'ok';

  private constructor(value: 'ok') {
    this._value = value;
  }

  static create(): HealthStatus {
    return new HealthStatus('ok');
  }

  get value(): 'ok' {
    return this._value;
  }
}
```

### 2. Application Layer (Application Business Rules)

**Location**: `src/application/`

**Purpose**: Orchestrates the flow of data between the domain and infrastructure layers. Contains use cases that implement specific business scenarios.

**Components**:
- **Use Cases**: Single-purpose application workflows (e.g., `GetHealthStatusUseCase`)
- **DTOs (Data Transfer Objects)**: Plain objects for transferring data between layers
- **Ports**: Interfaces for external services (implemented in infrastructure)
- **Application Services**: Coordinate multiple use cases if needed

**Rules**:
- Can depend on domain layer
- No dependencies on infrastructure layer (uses ports/interfaces)
- No framework-specific code
- Orchestrates domain logic

**Example**:
```typescript
// src/application/use-cases/get-health-status/get-health-status.use-case.ts
export class GetHealthStatusUseCase {
  execute(): HealthStatusDTO {
    const status = HealthStatus.create();
    return HealthStatusDTO.fromDomain(status);
  }
}
```

### 3. Infrastructure Layer (Frameworks & Drivers)

**Location**: `src/infrastructure/`

**Purpose**: Contains all framework-specific implementations, external service integrations, and technical details.

**Components**:
- **Web (Fastify)**: HTTP server, routes, controllers, middleware
- **Configuration**: Environment variables, server settings
- **Dependency Injection**: Container setup for wiring dependencies
- **Schemas**: JSON Schema validation (TypeBox)
- **Plugins**: Fastify plugins for cross-cutting concerns

**Rules**:
- Can depend on application and domain layers
- Contains all framework-specific code
- Implements interfaces defined in inner layers
- Handles external I/O

**Example**:
```typescript
// src/infrastructure/web/controllers/health.controller.ts
export class HealthController {
  constructor(private readonly getHealthStatus: GetHealthStatusUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto = this.getHealthStatus.execute();
    reply.code(200).send({ status: dto.status });
  }
}
```

---

## Folder Structure

### Complete Project Structure

```
readme-kit/
├── src/                                  # Source code
│   ├── domain/                           # Domain Layer (Enterprise Business Rules)
│   │   ├── entities/                     # Domain entities with identity
│   │   ├── value-objects/                # Immutable value objects
│   │   │   └── health-status.vo.ts       # Health status value object
│   │   ├── repositories/                 # Repository interfaces
│   │   ├── events/                       # Domain events
│   │   └── errors/                       # Domain-specific errors
│   │       └── health-check.error.ts     # Health check errors
│   │
│   ├── application/                      # Application Layer (Use Cases)
│   │   ├── use-cases/                    # Application workflows
│   │   │   └── get-health-status/        # Health status use case
│   │   │       ├── get-health-status.use-case.ts
│   │   │       └── get-health-status.dto.ts
│   │   ├── ports/                        # External service interfaces
│   │   └── dtos/                         # Data Transfer Objects
│   │       └── health-status.dto.ts
│   │
│   ├── infrastructure/                   # Infrastructure Layer (Frameworks)
│   │   ├── web/                          # Fastify web framework
│   │   │   ├── server.ts                 # Server setup and configuration
│   │   │   ├── routes/                   # Route definitions
│   │   │   │   ├── index.ts              # Route registration
│   │   │   │   └── health.routes.ts      # Health check routes
│   │   │   ├── controllers/              # HTTP handlers
│   │   │   │   └── health.controller.ts  # Health controller
│   │   │   ├── middlewares/              # Fastify hooks/middleware
│   │   │   │   └── error-handler.middleware.ts
│   │   │   ├── schemas/                  # JSON Schema validation
│   │   │   │   └── health.schema.ts      # Health response schema
│   │   │   └── plugins/                  # Fastify plugins
│   │   │       └── error-handler.plugin.ts
│   │   ├── config/                       # Configuration
│   │   │   ├── env.config.ts             # Environment variables
│   │   │   └── server.config.ts          # Server settings
│   │   └── di/                           # Dependency Injection
│   │       └── container.ts              # DI container
│   │
│   ├── shared/                           # Shared utilities
│   │   ├── utils/                        # Utility functions
│   │   ├── constants/                    # Application constants
│   │   │   └── http-status.constants.ts
│   │   └── types/                        # Shared TypeScript types
│   │
│   └── main.ts                           # Application entry point
│
├── tests/                                # Test suite (follows Testing Pyramid)
│   ├── unit/                             # 70% - Fast isolated tests (<10ms)
│   │   ├── domain/                       # Domain logic tests
│   │   │   └── value-objects/
│   │   │       └── health-status.vo.test.ts
│   │   └── application/                  # Use case tests
│   │       └── use-cases/
│   │           └── get-health-status.use-case.test.ts
│   │
│   ├── integration/                      # 20% - Component interaction tests
│   │   └── infrastructure/
│   │       └── web/
│   │           ├── routes/
│   │           │   └── health.routes.test.ts
│   │           └── controllers/
│   │               └── health.controller.test.ts
│   │
│   └── e2e/                             # 10% - End-to-end tests
│       └── api/
│           └── health-check.e2e.test.ts
│
├── specs/                                # Feature specifications
│   └── 001-create-basic-server/         # Current feature
│       ├── spec.md                       # Feature specification
│       ├── plan.md                       # Implementation plan
│       ├── research.md                   # Technology research
│       ├── data-model.md                 # Data structures
│       ├── quickstart.md                 # Setup guide
│       ├── tasks.md                      # Task breakdown
│       └── contracts/                    # API contracts
│           ├── openapi.yaml              # OpenAPI 3.1.0 spec
│           └── contract-tests.md         # Contract test specs
│
├── docs/                                 # Documentation
│   └── ARCHITECTURE.md                   # This file
│
├── Dockerfile                            # Multi-stage Docker build
├── docker-compose.yml                    # Docker Compose config
├── package.json                          # Node.js dependencies
├── tsconfig.json                         # TypeScript configuration
├── vitest.config.ts                      # Vitest test configuration
├── eslint.config.js                      # ESLint configuration
└── .prettierrc                           # Prettier configuration
```

### Layer Responsibilities

| Layer | Folder | Responsibilities |
|-------|--------|------------------|
| **Domain** | `src/domain/` | Business rules, entities, value objects, domain errors |
| **Application** | `src/application/` | Use cases, DTOs, application workflows |
| **Infrastructure** | `src/infrastructure/` | Fastify server, routes, controllers, database, external APIs |
| **Shared** | `src/shared/` | Cross-cutting utilities, constants, shared types |

---

## Data Flow

### Request-Response Flow

The following diagram illustrates how an HTTP request flows through the architecture:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         External Client                             │
│                    (Monitoring Tool, Browser)                       │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ HTTP GET /status
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE LAYER                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Fastify Server (server.ts)                                 │   │
│  │  - Listens on port 3000                                     │   │
│  │  - Registers routes and plugins                             │   │
│  │  - Handles incoming HTTP requests                           │   │
│  └───────────────────────────┬─────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Routes (health.routes.ts)                                  │   │
│  │  - Route: GET /status                                       │   │
│  │  - Validation: JSON Schema (health.schema.ts)              │   │
│  │  - Method checking: Non-GET → 405                          │   │
│  └───────────────────────────┬─────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Controller (health.controller.ts)                          │   │
│  │  - Receives FastifyRequest, FastifyReply                   │   │
│  │  - Calls use case                                           │   │
│  │  - Transforms DTO to HTTP response                         │   │
│  └───────────────────────────┬─────────────────────────────────┘   │
│                              │                                      │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                               │ Execute use case
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Use Case (get-health-status.use-case.ts)                  │   │
│  │  - Business logic: Create health status                    │   │
│  │  - Orchestrates domain objects                             │   │
│  │  - Returns DTO                                              │   │
│  └───────────────────────────┬─────────────────────────────────┘   │
│                              │                                      │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                               │ Create domain object
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DOMAIN LAYER                                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Value Object (health-status.vo.ts)                        │   │
│  │  - Immutable business object                               │   │
│  │  - Factory method: create()                                │   │
│  │  - Value: "ok"                                              │   │
│  └───────────────────────────┬─────────────────────────────────┘   │
│                              │                                      │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                               │ Return value
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  DTO (health-status.dto.ts)                                │   │
│  │  - Transform domain object to data transfer object        │   │
│  │  - Plain object: { status: "ok" }                          │   │
│  └───────────────────────────┬─────────────────────────────────┘   │
│                              │                                      │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                               │ Return DTO
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE LAYER                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Controller (health.controller.ts)                          │   │
│  │  - Receives DTO from use case                              │   │
│  │  - Sets HTTP status: 200 OK                                │   │
│  │  - Sends JSON response: {"status": "ok"}                   │   │
│  └───────────────────────────┬─────────────────────────────────┘   │
│                              │                                      │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                               │ HTTP 200 OK
                               │ Content-Type: application/json
                               │ Body: {"status": "ok"}
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         External Client                             │
│                     Receives success response                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Flow Steps Explained

1. **Client Request**: External client (monitoring tool, load balancer) sends `GET /status`
2. **Fastify Server**: Receives request, routes to appropriate handler
3. **Route Handler**: Validates request method (405 if not GET), applies JSON schema
4. **Controller**: Extracts request data, delegates to use case
5. **Use Case**: Orchestrates business logic, creates domain objects
6. **Domain Object**: Creates immutable `HealthStatus` value object
7. **DTO Transformation**: Converts domain object to plain data transfer object
8. **Controller Response**: Transforms DTO to HTTP response (200 OK + JSON)
9. **Client Response**: Client receives `{"status": "ok"}`

### Error Flow

```
Request → Routes → Schema Validation Failed → Error Handler → 400 Bad Request
Request → Routes → Non-GET Method → Fastify Default → 405 Method Not Allowed
Request → Controller → Use Case Exception → Error Handler → 500 Internal Error
```

---

## Dependency Direction

### The Dependency Rule

**Core Principle**: Dependencies must point **inward** toward the domain layer.

```
┌─────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE                        │
│  (Fastify, Express, Database, External APIs)            │
│                                                          │
│  Depends on ↓                                           │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     APPLICATION                          │
│      (Use Cases, Application Services)                  │
│                                                          │
│  Depends on ↓                                           │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                       DOMAIN                             │
│  (Entities, Value Objects, Business Rules)              │
│                                                          │
│  NO DEPENDENCIES (Pure business logic)                  │
└─────────────────────────────────────────────────────────┘
```

### Dependency Inversion Principle (DIP)

When the application layer needs external services (e.g., database, email), it defines **interfaces (ports)** that the infrastructure layer **implements**.

**Example**:

```typescript
// application/ports/health-repository.port.ts (Interface)
export interface HealthRepository {
  getStatus(): Promise<HealthStatus>;
}

// application/use-cases/get-health-status.use-case.ts
export class GetHealthStatusUseCase {
  constructor(private readonly repository: HealthRepository) {} // Depends on interface

  async execute(): Promise<HealthStatusDTO> {
    const status = await this.repository.getStatus();
    return HealthStatusDTO.fromDomain(status);
  }
}

// infrastructure/repositories/health.repository.ts (Implementation)
export class HealthRepositoryImpl implements HealthRepository {
  async getStatus(): Promise<HealthStatus> {
    // Database query or external API call
    return HealthStatus.create();
  }
}
```

### Why This Matters

1. **Testability**: Mock interfaces in tests without touching real implementations
2. **Framework Independence**: Swap Fastify for Express without touching business logic
3. **Database Independence**: Switch from PostgreSQL to MongoDB without changing use cases
4. **Maintainability**: Changes in infrastructure don't ripple into business rules

---

## Technology Stack

### Runtime & Language

| Technology | Version | Purpose | Rationale |
|-----------|---------|---------|-----------|
| **Node.js** | 20.0.0+ LTS | Runtime environment | Current LTS with 3+ years support, excellent ecosystem |
| **TypeScript** | 5.5.0+ | Language | Type safety, modern JavaScript features, strict mode |
| **ESM** | ES2022 | Module system | Modern standard, better tree-shaking, future-proof |

### Web Framework

| Technology | Version | Purpose | Rationale |
|-----------|---------|---------|-----------|
| **Fastify** | 5.6.1 | HTTP server | High performance (30k+ req/s), native TypeScript support, plugin ecosystem, JSON schema validation |

**Why Fastify over alternatives?**
- **Express**: Slower, callback-based, lacks native TypeScript support
- **Koa**: Good middleware but smaller ecosystem
- **NestJS**: Too heavyweight for simple services, adds unnecessary complexity

### Testing

| Technology | Version | Purpose | Rationale |
|-----------|---------|---------|-----------|
| **Vitest** | 3.2+ | Test runner | 10-20x faster than Jest, native ESM support, Jest-compatible API |
| **@vitest/coverage-v8** | 3.2+ | Coverage reporting | Built-in V8 coverage, accurate and fast |

**Testing Approach**:
- **Unit tests**: Use Fastify's `.inject()` method for lightweight HTTP testing
- **No supertest needed**: Fastify provides built-in testing utilities
- **AAA Pattern**: All tests follow Arrange-Act-Assert structure
- **Coverage target**: ≥80% for lines, functions, branches, statements

### Containerization

| Technology | Version | Purpose | Rationale |
|-----------|---------|---------|-----------|
| **Docker** | Latest | Containerization | Host-independent deployment, consistent environments |
| **Alpine Linux** | Latest | Base image | Minimal footprint (~40-50MB vs 200MB+ Debian), reduced attack surface |

**Docker Strategy**:
- **Multi-stage builds**: Separate build and runtime stages for smaller images (50-70% reduction)
- **Non-root user**: Security best practice (UID 1001)
- **Layer caching**: Optimized for fast rebuilds

### Code Quality

| Technology | Version | Purpose | Rationale |
|-----------|---------|---------|-----------|
| **ESLint** | 9.0.0+ | Linting | Code quality and consistency |
| **Prettier** | 3.3.0+ | Formatting | Automated code formatting |

### Configuration Files

```
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript strict mode configuration
├── vitest.config.ts      # Test framework configuration
├── eslint.config.js      # Linting rules
├── .prettierrc           # Formatting rules
├── Dockerfile            # Multi-stage production build
└── docker-compose.yml    # Container orchestration
```

---

## Design Principles

### 1. SOLID Principles

#### Single Responsibility Principle (SRP)
- Each class/module has **one reason to change**
- Controllers handle HTTP, use cases handle business logic, repositories handle data

#### Open/Closed Principle (OCP)
- **Open for extension, closed for modification**
- Use interfaces and dependency injection to add features without changing existing code

#### Liskov Substitution Principle (LSP)
- Implementations can be substituted for their interfaces
- TypeScript strict mode enforces type compatibility

#### Interface Segregation Principle (ISP)
- Small, focused interfaces instead of large, monolithic ones
- Clients depend only on methods they use

#### Dependency Inversion Principle (DIP)
- Depend on **abstractions (interfaces)**, not concrete implementations
- Application layer defines ports, infrastructure implements them

### 2. Clean Code Principles

#### DRY (Don't Repeat Yourself)
- Reusable components and utilities
- Shared code in `src/shared/`

#### YAGNI (You Aren't Gonna Need It)
- Implement only **current requirements**
- No speculative features

#### KISS (Keep It Simple, Stupid)
- Functions **<20 lines**
- Nesting **≤3 levels**
- Clear, descriptive names

### 3. Clean Architecture Principles

#### Framework Independence
- Business logic has **no knowledge of Fastify**
- Can swap frameworks without changing domain/application layers

#### Testability
- Each layer tested in isolation
- Use cases tested without HTTP server
- Domain logic tested without any dependencies

#### UI Independence
- Same business logic works with REST, GraphQL, CLI, or any other interface

#### Database Independence
- No database currently, but when added, business logic won't depend on specific database

---

## Testing Strategy

### Testing Pyramid

```
        ┌──────────┐
        │   E2E    │  10% - Full user flows, slowest
        │          │  Example: Complete /status request
        ├──────────┤
        │          │
        │Integration│ 20% - Component interaction
        │          │  Example: Routes + Controllers
        │          │
        ├──────────┤
        │          │
        │          │
        │   Unit   │  70% - Fast isolated tests
        │          │  Example: Use cases, domain objects
        │          │
        └──────────┘
```

### Test Coverage Requirements

| Metric | Target | Enforcement |
|--------|--------|-------------|
| Lines | ≥80% | CI/CD gate |
| Functions | ≥80% | CI/CD gate |
| Branches | ≥80% | CI/CD gate |
| Statements | ≥80% | CI/CD gate |

### Test Organization

```
tests/
├── unit/                           # 70% of tests
│   ├── domain/                     # Pure business logic tests
│   │   └── value-objects/
│   │       └── health-status.vo.test.ts
│   └── application/                # Use case tests
│       └── use-cases/
│           └── get-health-status.use-case.test.ts
│
├── integration/                    # 20% of tests
│   └── infrastructure/             # Component interaction tests
│       └── web/
│           ├── routes/
│           │   └── health.routes.test.ts
│           └── controllers/
│               └── health.controller.test.ts
│
└── e2e/                           # 10% of tests
    └── api/                        # End-to-end user flows
        └── health-check.e2e.test.ts
```

### AAA Pattern (Arrange-Act-Assert)

All tests follow this structure:

```typescript
test('should return health status ok', () => {
  // ARRANGE: Set up test data and dependencies
  const useCase = new GetHealthStatusUseCase();

  // ACT: Execute the code under test
  const result = useCase.execute();

  // ASSERT: Verify the outcome
  expect(result.status).toBe('ok');
});
```

### Performance Targets

| Test Type | Performance Target |
|-----------|-------------------|
| Unit tests | <10ms per test |
| Integration tests | <100ms per test |
| E2E tests | <1000ms per test |
| Full suite | <30 seconds |

---

## Summary

The readme-kit backend architecture follows **Clean Architecture** principles to ensure:

1. **Framework Independence**: Business logic is isolated from Fastify
2. **Testability**: Each layer can be tested independently with ≥80% coverage
3. **Maintainability**: Clear boundaries make changes predictable and safe
4. **Scalability**: Architecture supports future feature additions
5. **Type Safety**: TypeScript strict mode prevents runtime errors
6. **High Performance**: Fastify + Vitest provide excellent performance
7. **Security**: Docker with non-root user, Alpine base image

The architecture is intentionally designed to scale beyond the simple health check endpoint, providing a solid foundation for future services while maintaining code quality and adherence to established design principles.

---

**References**:
- Clean Architecture (Robert C. Martin)
- SOLID Principles
- Fastify Documentation (v5.x)
- TypeScript Handbook
- Vitest Documentation
- Feature Specification: `specs/001-create-basic-server/spec.md`
- Implementation Plan: `specs/001-create-basic-server/plan.md`
- Technology Research: `specs/001-create-basic-server/research.md`
