# API Contract Tests

**Feature**: Basic Health Check Server
**Branch**: 001-create-basic-server
**Date**: 2025-10-05

## Overview

This document defines contract tests that validate the API implementation against the OpenAPI specification. Contract tests ensure that the API behaves exactly as specified, with correct status codes, response schemas, and error handling.

## Test Framework

**Tool**: Vitest with Fastify inject()
**Location**: `tests/integration/infrastructure/web/routes/health.routes.test.ts`
**Purpose**: Validate API contracts without external network calls

## Contract Test Suite: GET /status

### Test Case 1: Successful Health Check

**Given**: The server is running
**When**: A GET request is sent to /status
**Then**:
- HTTP status code is 200 OK
- Content-Type is application/json
- Response body matches schema: `{"status": "ok"}`
- Response contains no additional properties

**Test Implementation**:
```typescript
describe('GET /status - Success Cases', () => {
  it('should return 200 OK with correct JSON response', async () => {
    // Arrange
    const app = await buildTestApp();

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/status'
    });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('should return response matching OpenAPI schema', async () => {
    const app = await buildTestApp();
    const response = await app.inject({
      method: 'GET',
      url: '/status'
    });

    const body = response.json();

    // Validate schema
    expect(body).toHaveProperty('status');
    expect(body.status).toBe('ok');
    expect(Object.keys(body)).toHaveLength(1); // No additional properties
  });
});
```

### Test Case 2: Query Parameters Ignored

**Given**: The server is running
**When**: A GET request is sent to /status with query parameters
**Then**:
- HTTP status code is 200 OK
- Response is identical to request without query parameters
- Query parameters are ignored (not validated, not logged)

**Test Implementation**:
```typescript
describe('GET /status - Query Parameter Handling', () => {
  it('should ignore valid query parameters', async () => {
    const app = await buildTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/status?foo=bar&baz=qux'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('should ignore invalid query parameters', async () => {
    const app = await buildTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/status?invalid[]=malformed&weird@param=value'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });
});
```

### Test Case 3: Headers Ignored

**Given**: The server is running
**When**: A GET request is sent to /status with custom headers
**Then**:
- HTTP status code is 200 OK
- Custom headers are ignored (not validated)
- Response is identical regardless of headers sent

**Test Implementation**:
```typescript
describe('GET /status - Header Handling', () => {
  it('should ignore custom headers', async () => {
    const app = await buildTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/status',
      headers: {
        'X-Custom-Header': 'custom-value',
        'Authorization': 'Bearer invalid-token',
        'X-Forwarded-For': '192.168.1.1'
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });
});
```

### Test Case 4: Concurrent Requests

**Given**: The server is running
**When**: Multiple concurrent GET requests are sent to /status
**Then**:
- All requests receive 200 OK responses
- All responses contain correct JSON
- No race conditions or errors occur

**Test Implementation**:
```typescript
describe('GET /status - Concurrency', () => {
  it('should handle concurrent requests successfully', async () => {
    const app = await buildTestApp();

    const requests = Array.from({ length: 100 }, () =>
      app.inject({
        method: 'GET',
        url: '/status'
      })
    );

    const responses = await Promise.all(requests);

    responses.forEach(response => {
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok' });
    });
  });
});
```

## Contract Test Suite: Non-GET Methods

### Test Case 5: POST Returns 405

**Given**: The server is running
**When**: A POST request is sent to /status
**Then**:
- HTTP status code is 405 Method Not Allowed
- Error response matches error schema

**Test Implementation**:
```typescript
describe('POST /status - Method Not Allowed', () => {
  it('should return 405 for POST requests', async () => {
    const app = await buildTestApp();

    const response = await app.inject({
      method: 'POST',
      url: '/status',
      payload: { data: 'test' }
    });

    expect(response.statusCode).toBe(405);
  });
});
```

### Test Case 6: PUT Returns 405

**Given**: The server is running
**When**: A PUT request is sent to /status
**Then**:
- HTTP status code is 405 Method Not Allowed

**Test Implementation**:
```typescript
describe('PUT /status - Method Not Allowed', () => {
  it('should return 405 for PUT requests', async () => {
    const app = await buildTestApp();

    const response = await app.inject({
      method: 'PUT',
      url: '/status',
      payload: { status: 'modified' }
    });

    expect(response.statusCode).toBe(405);
  });
});
```

### Test Case 7: DELETE Returns 405

**Given**: The server is running
**When**: A DELETE request is sent to /status
**Then**:
- HTTP status code is 405 Method Not Allowed

**Test Implementation**:
```typescript
describe('DELETE /status - Method Not Allowed', () => {
  it('should return 405 for DELETE requests', async () => {
    const app = await buildTestApp();

    const response = await app.inject({
      method: 'DELETE',
      url: '/status'
    });

    expect(response.statusCode).toBe(405);
  });
});
```

### Test Case 8: PATCH Returns 405

**Given**: The server is running
**When**: A PATCH request is sent to /status
**Then**:
- HTTP status code is 405 Method Not Allowed

**Test Implementation**:
```typescript
describe('PATCH /status - Method Not Allowed', () => {
  it('should return 405 for PATCH requests', async () => {
    const app = await buildTestApp();

    const response = await app.inject({
      method: 'PATCH',
      url: '/status',
      payload: [{ op: 'replace', path: '/status', value: 'modified' }]
    });

    expect(response.statusCode).toBe(405);
  });
});
```

## Contract Test Suite: Error Handling

### Test Case 9: Invalid Route

**Given**: The server is running
**When**: A GET request is sent to an invalid route
**Then**:
- HTTP status code is 404 Not Found
- Error response indicates route not found

**Test Implementation**:
```typescript
describe('Error Handling - Invalid Routes', () => {
  it('should return 404 for non-existent routes', async () => {
    const app = await buildTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/invalid-route'
    });

    expect(response.statusCode).toBe(404);
  });
});
```

## Performance Contract Tests

### Test Case 10: Response Time

**Given**: The server is running
**When**: A GET request is sent to /status
**Then**:
- Response time is less than 50ms (p95)
- No blocking operations occur

**Test Implementation**:
```typescript
describe('Performance - Response Time', () => {
  it('should respond within 50ms (p95)', async () => {
    const app = await buildTestApp();
    const timings: number[] = [];

    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      await app.inject({
        method: 'GET',
        url: '/status'
      });
      const duration = performance.now() - start;
      timings.push(duration);
    }

    timings.sort((a, b) => a - b);
    const p95 = timings[Math.floor(timings.length * 0.95)];

    expect(p95).toBeLessThan(50);
  });
});
```

## Test Utilities

### buildTestApp()

Helper function to create test application instance:

```typescript
// tests/utils/test-app.ts
import { FastifyInstance } from 'fastify';
import { buildServer } from '@infrastructure/web/server';

export async function buildTestApp(): Promise<FastifyInstance> {
  const app = await buildServer({
    logger: false // Disable logging in tests
  });

  await app.ready();

  return app;
}
```

## Contract Validation

### OpenAPI Schema Validation

Use OpenAPI validator to ensure implementation matches specification:

```typescript
// tests/integration/contract-validation.test.ts
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

describe('OpenAPI Contract Validation', () => {
  it('should have valid OpenAPI specification', () => {
    const specPath = path.join(__dirname, '../../specs/001-create-basic-server/contracts/openapi.yaml');
    const specContent = fs.readFileSync(specPath, 'utf8');
    const spec = yaml.load(specContent);

    expect(spec).toBeDefined();
    expect(spec.openapi).toBe('3.1.0');
    expect(spec.paths['/status']).toBeDefined();
    expect(spec.paths['/status'].get).toBeDefined();
  });
});
```

## Coverage Requirements

**Contract Test Coverage**:
- All endpoints documented in OpenAPI spec: 100%
- All HTTP methods: 100%
- All response codes: 100%
- All error scenarios: 100%

**Test Execution**:
```bash
# Run contract tests only
npm run test:integration -- health.routes.test.ts

# Run with coverage
npm run test:coverage -- health.routes.test.ts
```

## Success Criteria

✅ **All contract tests pass**: 100% pass rate
✅ **Schema validation**: Responses match OpenAPI schema exactly
✅ **Error handling**: All error cases return correct status codes
✅ **Performance**: Response times meet requirements (p95 < 50ms)
✅ **Concurrency**: Handle multiple simultaneous requests correctly
✅ **Method validation**: Non-GET methods return 405 consistently

## Next Steps

1. Implement routes and controllers to satisfy contracts
2. Run contract tests (expect failures initially - TDD approach)
3. Implement minimum code to make tests pass
4. Refactor while keeping tests green
5. Verify 100% contract coverage

---
*Contract tests defined: 2025-10-05*
*Following TDD principles: Write tests first, implement second*
