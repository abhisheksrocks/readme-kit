# Data Model: Basic Health Check Server

**Feature**: Basic Health Check Server
**Branch**: 001-create-basic-server
**Date**: 2025-10-05

## Overview

This feature implements a simple health check endpoint with minimal data modeling requirements. The health check is a liveness probe only, with no persistence, external dependencies, or complex state management.

## Domain Entities

### None Required

This feature does not require traditional domain entities (e.g., User, Order, Product) as it provides a stateless health check service. However, we define value objects and DTOs for type safety and clarity.

## Value Objects

### HealthStatus

**Purpose**: Represents the health status of the service

**Properties**:
- `status`: string (literal type: "ok")

**Validation Rules**:
- `status` MUST be exactly "ok" (per feature specification FR-004)
- No other values are permitted

**TypeScript Definition**:
```typescript
// src/domain/value-objects/health-status.value-object.ts

/**
 * Health status value object
 * Represents the operational status of the service
 */
export class HealthStatus {
  private readonly _status: 'ok' = 'ok';

  private constructor() {
    // Private constructor ensures only valid instances exist
  }

  /**
   * Create a HealthStatus instance
   * @returns {HealthStatus} A health status with "ok" value
   */
  static create(): HealthStatus {
    return new HealthStatus();
  }

  /**
   * Get the status value
   * @returns {string} The status value "ok"
   */
  get status(): 'ok' {
    return this._status;
  }

  /**
   * Convert to plain object for serialization
   * @returns {Object} Plain object with status property
   */
  toJSON(): { status: 'ok' } {
    return { status: this._status };
  }
}
```

**Rationale**:
- Encapsulates the "ok" status as a domain concept
- Type-safe: TypeScript literal type ensures only "ok" is valid
- Immutable: Cannot be modified after creation
- Single source of truth for health status representation

## Data Transfer Objects (DTOs)

### HealthStatusDTO

**Purpose**: Transfer health status data between layers (use case → controller → HTTP response)

**Properties**:
- `status`: "ok" (string literal)

**TypeScript Definition**:
```typescript
// src/application/dtos/health-status.dto.ts

/**
 * Data Transfer Object for health status
 * Used to transfer health status data between application layers
 */
export interface HealthStatusDTO {
  /**
   * Health status indicator
   * @example "ok"
   */
  readonly status: 'ok';
}

/**
 * Create a HealthStatusDTO from domain value object
 * @returns {HealthStatusDTO} Health status DTO
 */
export function createHealthStatusDTO(): HealthStatusDTO {
  return {
    status: 'ok'
  };
}
```

**Rationale**:
- Simple, flat structure suitable for JSON serialization
- Type-safe with TypeScript literal type
- Readonly properties prevent accidental mutation
- Decouples domain value object from HTTP response format

## HTTP Schemas

### HealthStatusResponseSchema

**Purpose**: JSON Schema for validating HTTP response structure

**Schema Definition**:
```typescript
// src/infrastructure/web/schemas/health.schema.ts
import { FastifySchema } from 'fastify';

/**
 * JSON Schema for health status response
 * Validates that responses conform to the specification
 */
export const healthStatusResponseSchema = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      const: 'ok',
      description: 'Health status indicator'
    }
  },
  required: ['status'],
  additionalProperties: false
} as const;

/**
 * Fastify route schema for GET /status endpoint
 */
export const getHealthStatusSchema: FastifySchema = {
  response: {
    200: healthStatusResponseSchema
  }
};
```

**Validation Rules**:
- Response MUST be an object
- Response MUST have a "status" property
- "status" MUST be exactly "ok" (const validation)
- No additional properties are allowed
- Schema enforced by Fastify's built-in JSON Schema validator

## Error Handling

### HealthCheckError

**Purpose**: Domain error for health check failures (future use)

**Note**: Currently not needed since the health check always returns "ok" (no external dependencies to fail). Included for completeness and future extensibility.

**TypeScript Definition**:
```typescript
// src/domain/errors/health-check.error.ts

/**
 * Health check domain error
 * Thrown when health check operation fails
 */
export class HealthCheckError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'HealthCheckError';
    Object.setPrototypeOf(this, HealthCheckError.prototype);
  }
}
```

**Usage**: Reserved for future when external dependencies (database, cache, etc.) are added and health checks can fail.

## State Transitions

### None

The health check endpoint is stateless. There are no state transitions, persistence requirements, or lifecycle events.

## Relationships

### None

No relationships between entities as this is a single-endpoint feature with no data persistence or entity associations.

## Data Flow

```
HTTP Request (GET /status)
    ↓
Controller (infrastructure/web/controllers/health.controller.ts)
    ↓
Use Case (application/use-cases/get-health-status/get-health-status.use-case.ts)
    ↓
Value Object (domain/value-objects/health-status.value-object.ts)
    ↓
DTO (application/dtos/health-status.dto.ts)
    ↓
Controller → JSON Response
    ↓
HTTP Response 200 OK
{
  "status": "ok"
}
```

## Persistence

### Not Required

- No database needed (per feature specification FR-006)
- No file storage needed
- No caching needed
- Stateless operation only

## Constraints

1. **Immutability**: All value objects and DTOs are immutable
2. **Type Safety**: TypeScript strict mode enforces type correctness
3. **Validation**: JSON Schema validates response structure
4. **No Side Effects**: Health check has no side effects (no logging per FR-008)

## Future Extensibility

When external dependencies (database, cache, message queues) are added:

1. **Expand HealthStatus Value Object**:
   ```typescript
   interface HealthStatus {
     status: 'ok' | 'degraded' | 'unavailable';
     checks?: {
       database?: boolean;
       cache?: boolean;
       externalServices?: boolean;
     };
   }
   ```

2. **Add Health Check Repository Interface**:
   ```typescript
   interface IHealthCheckRepository {
     checkDatabase(): Promise<boolean>;
     checkCache(): Promise<boolean>;
     checkExternalServices(): Promise<boolean>;
   }
   ```

3. **Update Use Case**:
   - Inject health check repository
   - Aggregate check results
   - Return comprehensive status

## Summary

The data model for the basic health check server is intentionally minimal:
- **Value Object**: HealthStatus (immutable "ok" status)
- **DTO**: HealthStatusDTO (transfer object for layers)
- **Schema**: JSON Schema for response validation
- **No persistence**: Stateless operation
- **No relationships**: Single isolated endpoint
- **Type-safe**: TypeScript strict mode enforced
- **Extensible**: Architecture supports future expansion

This design follows Clean Architecture principles while maintaining YAGNI (You Aren't Gonna Need It) - we implement only what's required now, with clear extension points for future needs.

---
*Data model created: 2025-10-05*
*Aligned with Constitution v1.0.0 and feature specification*
