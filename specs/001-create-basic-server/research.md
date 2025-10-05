# Research Findings: Basic Health Check Server

**Feature**: Basic Health Check Server
**Branch**: 001-create-basic-server
**Date**: 2025-10-05

## Technology Stack Decisions

### 1. Fastify Framework

**Decision:** Fastify v5.6.1 (latest stable)

**Rationale:**
- Current major version (v5.x) with active maintenance as of October 2025
- Requires Node.js ≥20.0.0, aligning with constitutional requirement
- Excellent TypeScript support with comprehensive type definitions
- Native ESM support (modern standard)
- High performance (up to 30k+ requests/second)
- Robust plugin ecosystem

**Alternatives Considered:**
- Express.js: More mature but slower, lacks native TypeScript support, callback-based
- Koa: Good middleware design but smaller ecosystem
- NestJS: Too heavyweight for simple health check server, adds unnecessary complexity

**Installation:**
```bash
npm i fastify
npm i -D typescript @types/node
```

### 2. TypeScript Configuration

**Decision:** Strict TypeScript with ESM modules

**Rationale:**
- Constitutional requirement: TypeScript ≥5.0.0 with strict mode enabled
- ESM is modern standard with better tree-shaking
- Fastify v5 fully supports ESM
- Type safety prevents runtime errors
- Better IDE support and developer experience

**Configuration:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "esModuleInterop": true,
    "target": "ES2022",
    "lib": ["ES2023"],
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "sourceMap": true
  }
}
```

**Alternatives Considered:**
- CommonJS modules: Legacy, less efficient for tree-shaking
- Less strict TypeScript: Rejected due to constitutional requirements

### 3. Project Structure

**Decision:** Clean Architecture with Fastify-adapted layers

**Rationale:**
- Constitutional requirement for Clean Architecture
- Clear separation of concerns (infrastructure vs domain)
- Fastify-specific code isolated in infrastructure layer
- Supports dependency inversion and testability
- Scalable for future feature additions

**Structure:**
```
src/
├── domain/                    # Business entities and interfaces
│   ├── entities/
│   ├── repositories/          # Interfaces only
│   └── errors/
├── application/               # Use cases and business logic
│   ├── use-cases/
│   ├── ports/                 # External service interfaces
│   └── dtos/
├── infrastructure/            # Fastify and external dependencies
│   ├── web/
│   │   ├── server.ts         # Fastify server setup
│   │   ├── routes/           # Route definitions
│   │   ├── controllers/      # HTTP handlers
│   │   ├── middlewares/
│   │   ├── schemas/          # JSON Schema validation
│   │   └── plugins/
│   ├── config/
│   └── di/                   # Dependency injection
└── main.ts                   # Entry point

tests/
├── unit/                     # 70% of tests
├── integration/              # 20% of tests
└── e2e/                      # 10% of tests
```

**Alternatives Considered:**
- MVC structure: Too coupled, doesn't enforce Clean Architecture
- Feature-based structure: Good for small apps but lacks clear boundaries

### 4. Health Check Implementation

**Decision:** Simple health endpoint for liveness check only (no external dependencies currently)

**Rationale:**
- Feature spec requirement: Liveness check only (server is running)
- No database or external services to check currently
- Simple JSON response: `{"status": "ok"}`
- HTTP 200 OK for successful health check
- HTTP 405 Method Not Allowed for non-GET methods
- No logging for /status endpoint per requirements

**Implementation Approach:**
```typescript
// Simple route handler for /status
fastify.get('/status', {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string', const: 'ok' }
        },
        required: ['status']
      }
    }
  }
}, async (request, reply) => {
  return { status: 'ok' };
});

// Method validation handled by Fastify automatically
// Returns 405 for non-GET methods
```

**Future Considerations:**
- When database is added: Use @fastify/under-pressure plugin for comprehensive health checks
- Readiness vs liveness separation when external dependencies exist
- Metrics endpoint for monitoring (separate from health check)

**Alternatives Considered:**
- @fastify/under-pressure: Overkill for current requirements (no external dependencies)
- fastify-healthcheck: Good but unnecessary for simple liveness check
- Manual implementation: Chosen for simplicity and meeting exact requirements

### 5. Testing Framework

**Decision:** Vitest 3.2+ for all testing layers

**Rationale:**
- Constitutional requirement: "Use Vitest for new TypeScript projects"
- 10-20x faster than Jest
- Native ESM support (aligns with Fastify v5)
- Excellent TypeScript support
- Jest-compatible API for easy learning
- Built-in coverage with V8 provider

**Configuration:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    }
  }
});
```

**Testing Approach:**
- Use Fastify's `.inject()` method for lightweight HTTP testing
- No need for actual HTTP server or supertest
- AAA pattern (Arrange-Act-Assert) per constitutional requirement
- Test coverage ≥80% per constitutional requirement

**Alternatives Considered:**
- Jest: Slower, constitutional preference for Vitest
- Ava: Fast but smaller ecosystem
- Tap: Fastify's original framework but less TypeScript-friendly

### 6. Docker Setup

**Decision:** Multi-stage Docker build with Alpine base image

**Rationale:**
- Constitutional requirement: Dockerizable setup independent of host environment
- Multi-stage builds reduce final image size by 50-70%
- Alpine Linux: Small footprint (~40-50MB vs 200MB+ Debian)
- Node.js 20 LTS support
- Non-root user for security
- Separates build dependencies from runtime

**Implementation:**
```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev

# Stage 2: Build TypeScript
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production dependencies
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Stage 4: Runtime
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
USER nodejs
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

**Docker Compose for Development:**
```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      target: runner
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
```

**Alternatives Considered:**
- Distroless images: Maximum security but harder to debug, overkill for current needs
- Single-stage build: Simpler but creates bloated images
- Debian-based images: Larger size, unnecessary packages

### 7. Development Dependencies

**Decision:** Minimal essential tooling

**Rationale:**
- Keep dependencies lean and focused
- Use standard Node.js/TypeScript tooling
- Constitutional requirements for linting and formatting

**Essential Dependencies:**
```json
{
  "dependencies": {
    "fastify": "^5.6.1"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/node": "^20.0.0",
    "vitest": "^3.2.0",
    "@vitest/coverage-v8": "^3.2.0",
    "@vitest/ui": "^3.2.0",
    "eslint": "^9.0.0",
    "prettier": "^3.3.0"
  }
}
```

**Alternatives Considered:**
- Additional frameworks: Not needed for simple health check server
- Monitoring libraries: Can be added later when needed
- Validation libraries: Fastify has built-in JSON Schema validation

## Performance Considerations

### Port Configuration

**Decision:** Fixed port 3000

**Rationale:**
- Feature spec requirement: "Port 3000 (fixed)"
- Standard convention for Node.js applications
- Simplifies container orchestration
- Can be overridden via environment variable if needed

**Implementation:**
```typescript
// Bind to 0.0.0.0 for container compatibility
await fastify.listen({
  port: 3000,
  host: '0.0.0.0'
});
```

### Response Format

**Decision:** JSON with minimal payload

**Rationale:**
- Feature spec requirement: JSON object with "status" field only
- Minimal payload reduces network overhead
- Standard JSON content-type for API responses
- Easy to parse for monitoring tools

**Schema:**
```json
{
  "status": "ok"
}
```

### Request Handling

**Decision:** No rate limiting, handle all requests

**Rationale:**
- Feature spec requirement: "No rate limiting (handle all requests)"
- Health check endpoints should always be available
- Low computational overhead for simple JSON response
- Rate limiting can be added later if monitoring tools overwhelm the endpoint

### Error Handling

**Decision:** Ignore invalid query parameters/headers, return normal response

**Rationale:**
- Feature spec requirement: "Ignore invalid params/headers and return normal response"
- Health check should be forgiving and always accessible
- Simplifies implementation
- Reduces failure points for monitoring systems

## Security Considerations

### Docker Security

**Decision:** Run as non-root user, minimal base image

**Implementation:**
- Create dedicated nodejs user (UID 1001)
- Alpine base reduces attack surface
- No shell or package manager in final image
- Read-only filesystem where possible

### HTTP Security

**Decision:** Basic security for health endpoint

**Rationale:**
- Health endpoint is public and non-sensitive
- No authentication required for liveness checks
- Standard HTTP security headers can be added later
- Focus on availability over strict security for /status

## Dependencies Summary

**No Runtime Dependencies Beyond Fastify:**
- No database drivers needed (no database requirement)
- No external service clients needed
- No authentication libraries needed
- Minimal attack surface

## Open Questions Resolved

1. ✅ Response format: JSON with `{"status": "ok"}`
2. ✅ HTTP status code: 200 OK
3. ✅ Port number: 3000 (fixed)
4. ✅ Non-GET methods: 405 Method Not Allowed
5. ✅ Logging: No logging for /status requests
6. ✅ Health check type: Liveness only
7. ✅ Rate limiting: None
8. ✅ Invalid parameters: Ignore and return normal response

## Next Steps

1. ✅ Research complete - all technical decisions documented
2. ⏭️ Phase 1: Design data models and contracts
3. ⏭️ Phase 1: Create API contracts (OpenAPI schema)
4. ⏭️ Phase 1: Generate contract tests
5. ⏭️ Phase 1: Create quickstart guide
6. ⏭️ Phase 2: Generate task breakdown

---
*Research completed: 2025-10-05*
*All findings align with Constitution v1.0.0 and feature specification*
