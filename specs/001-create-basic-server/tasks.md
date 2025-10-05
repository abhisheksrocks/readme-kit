# Tasks: Basic Health Check Server

**Feature**: Basic Health Check Server
**Branch**: `001-create-basic-server` (already checked out)
**Input**: Design documents from `/Users/abhishek/Documents/Personal/readme-kit/specs/001-create-basic-server/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Execution Flow

```
1. Load plan.md from feature directory → Extract tech stack, structure
2. Load design documents → contracts/, data-model.md, research.md
3. Execute tasks in dependency order:
   → Setup (T001-T017): Project init, dependencies, configs, structure
   → Tests (T018-T028): Write failing tests (TDD Red Phase)
   → Implementation (T029-T037): Make tests pass (TDD Green Phase)
   → Docker (T038-T040): Containerization and validation
   → Documentation (T041-T043): README, API docs, architecture
   → Validation (T044-T063): Coverage, quality, deployment tests
4. Validate completeness → All FRs met, coverage ≥80%, tests pass
5. Return: SUCCESS (feature ready for merge)
```

## Path Conventions
- **Repository root**: `/Users/abhishek/Documents/Personal/readme-kit/`
- **Source code**: `src/` (at repository root)
- **Tests**: `tests/` (at repository root)
- **Specs**: `specs/001-create-basic-server/`

---

## Phase 1: Setup & Configuration

### Project Initialization

**T001** Initialize npm project with ESM configuration
- Run: `npm init -y`
- Edit `package.json`:
  - Set `"type": "module"`
  - Set `"name": "readme-kit"`
  - Set `"version": "1.0.0"`
  - Set `"engines": { "node": ">=20.0.0" }`
- **Dependencies**: None
- **Duration**: 5 min

**T002** Install core runtime dependencies
- Run: `npm install fastify@5.6.1 fastify-plugin@5.0.1`
- **Dependencies**: T001 (requires package.json)
- **Duration**: 2 min

**T003** Install TypeScript and development tooling
- Run: `npm install -D typescript@5.5.4 @types/node@20.17.13 tsx@4.19.2`
- **Dependencies**: T001
- **Duration**: 2 min

**T004** Install testing framework and coverage tools
- Run: `npm install -D vitest@3.2.3 @vitest/coverage-v8@3.2.3`
- **Dependencies**: T001
- **Duration**: 2 min

**T005** Install linting and formatting tools
- Run: `npm install -D eslint@9.19.0 @typescript-eslint/parser@8.24.0 @typescript-eslint/eslint-plugin@8.24.0 prettier@3.4.2 eslint-config-prettier@10.0.1`
- **Dependencies**: T001
- **Duration**: 2 min

**T006** Install pre-commit tooling
- Run: `npm install -D husky@10.0.0 lint-staged@16.0.1`
- **Dependencies**: T001
- **Duration**: 2 min

### Configuration Files

**T007** [P] Create TypeScript configuration with NodeNext modules
- Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```
- **Dependencies**: T001
- **Duration**: 5 min

**T008** [P] Create Vitest configuration with 80% coverage enforcement
- Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.config.ts',
        '**/*.d.ts'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
});
```
- **Dependencies**: T001
- **Duration**: 5 min

**T009** [P] Create ESLint configuration
- Create `eslint.config.js`:
```javascript
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  }
];
```
- **Dependencies**: T001
- **Duration**: 5 min

**T010** [P] Create Prettier configuration
- Create `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```
- Create `.prettierignore`:
```
node_modules/
dist/
coverage/
.env
*.log
```
- **Dependencies**: T001
- **Duration**: 3 min

**T011** [P] Create lint-staged configuration
- Create `.lintstagedrc.json`:
```json
{
  "*.ts": [
    "eslint --fix",
    "prettier --write"
  ]
}
```
- **Dependencies**: T001
- **Duration**: 2 min

**T012** Initialize husky and create pre-commit hook
- Run: `npx husky init`
- Edit `.husky/pre-commit`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```
- **Dependencies**: T006
- **Duration**: 3 min

**T012.5** [P] Configure commitlint for conventional commit enforcement
- Install commitlint packages: `npm install -D @commitlint/cli@18.6.1 @commitlint/config-conventional@18.6.3`
- Create `.commitlintrc.json`:
```json
{
  "extends": ["@commitlint/config-conventional"]
}
```
- Create `.husky/commit-msg`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx commitlint --edit $1
```
- Make executable: `chmod +x .husky/commit-msg`
- **Dependencies**: T012 (husky initialized)
- **Duration**: 5 min
- **Constitutional Requirement**: Constitution v1.0.0 Section VI requires commitlint with @commitlint/config-conventional

**T013** [P] Create .gitignore file
- Create `.gitignore`:
```
node_modules/
dist/
*.tsbuildinfo
coverage/
.nyc_output/
.env
.env.local
.env.*.local
logs/
*.log
npm-debug.log*
.DS_Store
Thumbs.db
.vscode/
.idea/
*.swp
*.swo
*~
tmp/
temp/
```
- **Dependencies**: T001
- **Duration**: 2 min

**T014** [P] Create .env.example file
- Create `.env.example`:
```
# Server Configuration
PORT=3000
NODE_ENV=production
```
- **Dependencies**: T001
- **Duration**: 2 min

**T015** [P] Create .dockerignore file
- Create `.dockerignore`:
```
node_modules
.git
tests
coverage
dist
.env
*.log
.vscode
.idea
*.md
.gitignore
.prettierrc
.lintstagedrc.json
```
- **Dependencies**: T001
- **Duration**: 2 min

**T016** Create Dockerfile with multi-stage build
- Create `Dockerfile`:
```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build
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
    adduser -S nodejs -u 1001 && \
    apk add --no-cache wget
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
USER nodejs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/status || exit 1
CMD ["node", "dist/main.js"]
```
- **Dependencies**: T001-T006 (all dependencies installed)
- **Duration**: 10 min

**T017** Create minimal YAGNI folder structure
- Run:
```bash
mkdir -p src/infrastructure/web/routes
mkdir -p src/infrastructure/web/controllers
mkdir -p src/infrastructure/web/plugins
mkdir -p src/infrastructure/config
mkdir -p src/shared/types
mkdir -p src/shared/constants
mkdir -p tests/unit
mkdir -p tests/integration/infrastructure/web/routes
mkdir -p tests/utils
```
- **Dependencies**: T001
- **Duration**: 2 min

---

## Phase 2: Test Phase (TDD - Red Phase)

### Test Utilities

**T018** Create test utilities helper
- File: `tests/utils/test-app.ts`
- Content:
```typescript
import { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/infrastructure/web/server.js';

export async function buildTestApp(): Promise<FastifyInstance> {
  const app = await buildServer({
    logger: false
  });

  await app.ready();
  return app;
}
```
- **Dependencies**: T017 (folder structure)
- **Duration**: 5 min
- **Note**: Uses relative import path compatible with NodeNext module resolution

### Contract Tests (Write BEFORE Implementation)

**T019** Create health routes contract test file structure
- File: `tests/integration/infrastructure/web/routes/health.routes.test.ts`
- Create file with imports and describe block stubs for all test categories
- **Dependencies**: T017, T018
- **Duration**: 5 min

**T020** [P] Implement contract test - GET /status success
- File: `tests/integration/infrastructure/web/routes/health.routes.test.ts`
- Test Case 1: GET /status → 200 OK with {"status": "ok"}
- Test Case 2: Response matches OpenAPI schema
- **Dependencies**: T019
- **Duration**: 10 min
- **Note**: These tests will FAIL until implementation

**T021** [P] Implement contract test - Query parameters ignored
- File: `tests/integration/infrastructure/web/routes/health.routes.test.ts`
- Test: GET /status?foo=bar → 200 OK (params ignored)
- **Dependencies**: T019
- **Duration**: 5 min
- **Note**: These tests will FAIL until implementation

**T022** [P] Implement contract test - Headers ignored
- File: `tests/integration/infrastructure/web/routes/health.routes.test.ts`
- Test: GET /status with custom headers → 200 OK (headers ignored)
- **Dependencies**: T019
- **Duration**: 5 min
- **Note**: These tests will FAIL until implementation

**T023** [P] Implement contract test - Concurrent requests
- File: `tests/integration/infrastructure/web/routes/health.routes.test.ts`
- Test: 100 concurrent GET requests → all 200 OK
- **Dependencies**: T019
- **Duration**: 10 min
- **Note**: These tests will FAIL until implementation

**T024** [P] Implement contract tests - Method Not Allowed
- File: `tests/integration/infrastructure/web/routes/health.routes.test.ts`
- Tests: POST, PUT, DELETE, PATCH /status → 405
- **Dependencies**: T019
- **Duration**: 10 min
- **Note**: These tests will FAIL until implementation

**T025** [P] Implement contract test - 404 Not Found
- File: `tests/integration/infrastructure/web/routes/health.routes.test.ts`
- Test: GET /invalid-route → 404
- **Dependencies**: T019
- **Duration**: 5 min

**T026** [P] Implement contract test - Performance
- File: `tests/integration/infrastructure/web/routes/health.routes.test.ts`
- Test: 100 requests, p95 < 50ms
- **Dependencies**: T019
- **Duration**: 10 min

**T027** Add npm scripts to package.json
- Edit `package.json` scripts section:
```json
{
  "scripts": {
    "dev": "tsx watch src/main.ts",
    "build": "tsc",
    "start": "node dist/main.js",
    "test": "vitest run",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "vitest run tests/e2e",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src tests",
    "lint:fix": "eslint src tests --fix",
    "format": "prettier --write \"src/**/*.ts\" \"tests/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\" \"tests/**/*.ts\"",
    "type-check": "tsc --noEmit",
    "prepare": "husky"
  }
}
```
- **Dependencies**: T001-T012
- **Duration**: 5 min

**T028** Run tests and verify failures (TDD Red Phase)
- Command: `npm test`
- **Expected Result**: Tests FAIL (routes/controllers not implemented yet)
- **Dependencies**: T020-T026
- **Duration**: 2 min
- **Success**: All tests run but fail with clear error messages

---

## Phase 3: Implementation (TDD - Green Phase)

### Shared Layer

**T029** [P] Create HTTP status constants
- File: `src/shared/constants/http-status.constants.ts`
```typescript
export const HTTP_STATUS = {
  OK: 200,
  METHOD_NOT_ALLOWED: 405,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;
```
- **Dependencies**: T017
- **Duration**: 3 min

**T030** [P] Create health response type
- File: `src/shared/types/health.types.ts`
```typescript
export interface HealthResponse {
  status: 'ok';
}
```
- **Dependencies**: T017
- **Duration**: 2 min

### Configuration Layer

**T031** [P] Create environment configuration
- File: `src/infrastructure/config/environment.ts`
```typescript
export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'production',
  host: process.env.HOST || '0.0.0.0'
} as const;
```
- **Dependencies**: T017
- **Duration**: 5 min

### Infrastructure Layer

**T032** Create health controller
- File: `src/infrastructure/web/controllers/health.controller.ts`
```typescript
import { FastifyReply, FastifyRequest } from 'fastify';
import { HealthResponse } from '../../../shared/types/health.types.js';

export async function healthController(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<HealthResponse> {
  return { status: 'ok' };
}
```
- **Dependencies**: T002 (fastify installation), T030 (health types)
- **Duration**: 5 min

**T033** Create health routes
- File: `src/infrastructure/web/routes/health.routes.ts`
```typescript
import { FastifyInstance } from 'fastify';
import { healthController } from '../controllers/health.controller.js';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
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
  }, healthController);
}
```
- **Dependencies**: T002 (fastify installation), T032 (controller)
- **Duration**: 10 min

**T034** [P] Create error handler plugin
- File: `src/infrastructure/web/plugins/error-handler.plugin.ts`
```typescript
import { FastifyInstance, FastifyError } from 'fastify';
import fp from 'fastify-plugin';

async function errorHandler(fastify: FastifyInstance): Promise<void> {
  fastify.setErrorHandler((error: FastifyError, request, reply) => {
    const statusCode = error.statusCode || 500;

    reply.status(statusCode).send({
      statusCode,
      error: error.name || 'Error',
      message: error.message
    });
  });
}

export default fp(errorHandler);
```
- **Dependencies**: T002 (fastify installation), T017
- **Duration**: 10 min

**T035** Create Fastify server setup
- File: `src/infrastructure/web/server.ts`
```typescript
import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { healthRoutes } from './routes/health.routes.js';
import errorHandler from './plugins/error-handler.plugin.js';

export async function buildServer(
  opts: FastifyServerOptions = {}
): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: opts.logger ?? true,
    ...opts
  });

  await fastify.register(errorHandler);
  await fastify.register(healthRoutes);

  return fastify;
}
```
- **Dependencies**: T002 (fastify installation), T033, T034 (routes, plugins)
- **Duration**: 10 min

**T036** Create main entry point with graceful shutdown
- File: `src/main.ts`
```typescript
import { buildServer } from './infrastructure/web/server.js';
import { config } from './infrastructure/config/environment.js';

const start = async (): Promise<void> => {
  try {
    const server = await buildServer();

    await server.listen({
      port: config.port,
      host: config.host
    });

    const signals = ['SIGINT', 'SIGTERM'] as const;

    for (const signal of signals) {
      process.on(signal, async () => {
        console.log(`Received ${signal}, closing server gracefully...`);
        await server.close();
        process.exit(0);
      });
    }

  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

start();
```
- **Dependencies**: T035, T031 (server, config)
- **Duration**: 10 min

**T037** Run tests and verify they pass (TDD Green Phase)
- Command: `npm test`
- **Expected Result**: All tests PASS
- **Dependencies**: T029-T036 (all implementation complete)
- **Duration**: 2 min
- **Success**: All contract tests pass, implementation satisfies contracts

**T037.5** Add and verify TSDoc documentation
- Install eslint-plugin-tsdoc: `npm install -D eslint-plugin-tsdoc`
- Add TSDoc comments to all exported functions and interfaces:
  - `src/infrastructure/web/server.ts`: Document `buildServer` function
  - `src/infrastructure/web/controllers/health.controller.ts`: Document `healthController` function
  - `src/infrastructure/web/routes/health.routes.ts`: Document `healthRoutes` function
  - `src/infrastructure/config/environment.ts`: Document config object
  - `src/shared/types/health.types.ts`: Document `HealthResponse` interface
- Add TSDoc validation to eslint.config.js
- Run: `npm run lint` to verify TSDoc compliance
- **Dependencies**: T036 (implementation complete)
- **Duration**: 15 min
- **Success**: All exported items have TSDoc comments with @param, @returns tags

---

## Phase 4: Docker & Deployment

**T038** Create docker-compose.yml
- File: `docker-compose.yml`
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
      - PORT=3000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/status"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```
- **Dependencies**: T016 (Dockerfile), T037 (implementation complete)
- **Duration**: 5 min

**T039** Build Docker image
- Command: `docker build -t readme-kit-health-check:latest .`
- **Expected Result**: Image builds successfully
- **Dependencies**: T016, T038
- **Duration**: 3 min

**T040** Test Docker deployment and health check
- Commands:
  - `docker run -d -p 3000:3000 --name health-check-test readme-kit-health-check:latest`
  - `curl http://localhost:3000/status` (should return {"status":"ok"})
  - Wait 35 seconds for health check to run
  - `docker inspect --format='{{.State.Health.Status}}' health-check-test` (should be "healthy")
  - `docker stop health-check-test && docker rm health-check-test`
- **Dependencies**: T039
- **Duration**: 8 min
- **Success**: Container runs, /status responds, health check passes

---

## Phase 5: Documentation

**T041** [P] Create comprehensive README.md
- File: `README.md` at repository root
- Sections:
  - Project overview and purpose
  - Prerequisites (Node.js 20+, Docker)
  - Installation instructions
  - Development workflow (dev, build, test commands)
  - Testing guide (unit, integration, coverage)
  - Docker deployment instructions
  - Architecture overview (Clean Architecture)
  - API documentation (link to OpenAPI spec)
  - Environment variables (PORT, NODE_ENV)
  - Contributing guidelines
  - License (MIT)
- **Dependencies**: T037 (implementation complete)
- **Duration**: 30 min

**T042** [P] Validate OpenAPI specification
- File: `specs/001-create-basic-server/contracts/openapi.yaml`
- Verify: All endpoints documented, schemas accurate, examples present
- Command: `npx @redocly/cli lint specs/001-create-basic-server/contracts/openapi.yaml`
- **Dependencies**: T037
- **Duration**: 5 min

**T043** Create architecture documentation
- Create `docs/ARCHITECTURE.md` (separate from README.md to avoid conflicts)
- Content:
  - Clean Architecture layers explanation
  - Folder structure diagram
  - Data flow (Request → Routes → Controller → Response)
  - Dependency direction (Infrastructure → Application → Domain)
- **Dependencies**: T037 (implementation complete)
- **Duration**: 20 min

**T043.5** [P] Create ADR-001: Fastify framework selection
- Create `docs/adr/001-fastify-framework.md`
- Sections: Status (Accepted), Context, Decision, Consequences
- Document why Fastify chosen over Express, Hapi, Koa
- Reference research.md findings
- **Dependencies**: T037 (implementation complete)
- **Duration**: 15 min

**T043.6** [P] Create ADR-002: Docker multi-stage Alpine build
- Create `docs/adr/002-docker-alpine-build.md`
- Document multi-stage build strategy and Alpine base image choice
- Include security and size optimization rationale
- **Dependencies**: T037 (implementation complete)
- **Duration**: 15 min

**T043.7** [P] Create ADR-003: Vitest testing framework
- Create `docs/adr/003-vitest-testing.md`
- Document Vitest selection over Jest
- Include performance and ESM support rationale
- **Dependencies**: T037 (implementation complete)
- **Duration**: 15 min

**T043.8** [P] Create ADR-004: Clean Architecture pattern
- Create `docs/adr/004-clean-architecture.md`
- Document Clean Architecture adoption for single endpoint
- Justify structure despite YAGNI concerns (future scalability)
- **Dependencies**: T037 (implementation complete)
- **Duration**: 15 min

---

## Phase 6: Validation & Quality Assurance

### Code Quality

**T044** [P] Run ESLint validation
- Command: `npm run lint`
- **Expected**: Zero errors, zero warnings
- **Dependencies**: T037
- **Duration**: 2 min

**T045** [P] Run Prettier format check
- Command: `npm run format:check`
- **Expected**: All files properly formatted
- **Dependencies**: T037
- **Duration**: 2 min

**T046** [P] Run TypeScript type checking
- Command: `npm run type-check`
- **Expected**: Zero type errors, strict mode compliance
- **Dependencies**: T037
- **Duration**: 2 min

### Test Coverage

**T047** Run full test suite with coverage
- Command: `npm run test:coverage`
- **Expected**: All tests pass, coverage report generated
- **Dependencies**: T037
- **Duration**: 3 min

**T048** Validate coverage meets 80% threshold
- Review: `coverage/index.html` or console output
- **Expected**: Lines ≥80%, Functions ≥80%, Branches ≥80%, Statements ≥80%
- **Dependencies**: T047
- **Duration**: 2 min

**T048.5** Validate testing pyramid distribution (70/20/10)
- Count tests by category:
  - Unit tests: tests/unit/**/*.test.ts
  - Integration tests: tests/integration/**/*.test.ts
  - E2E tests: tests/e2e/**/*.test.ts
- Calculate distribution percentages
- **Expected**: Approximately 70% unit, 20% integration, 10% e2e (±5% tolerance)
- Document actual distribution in test coverage report
- **Dependencies**: T047
- **Duration**: 5 min

### Build & Deployment

**T049** Validate production build
- Command: `npm run build`
- **Expected**: TypeScript compiles successfully, dist/ contains JS files
- **Dependencies**: T046
- **Duration**: 2 min

**T050** Validate production server runs
- Commands:
  - `npm start` (run in background)
  - `curl http://localhost:3000/status`
  - Stop server
- **Expected**: Server starts, /status returns {"status":"ok"}
- **Dependencies**: T049
- **Duration**: 3 min

### Functional Requirements Validation

**T051** [P] Validate FR-001: GET /status returns 200 OK
- Test: `curl -i http://localhost:3000/status`
- **Expected**: HTTP 200, Content-Type: application/json, Body: {"status":"ok"}
- **Dependencies**: T050
- **Duration**: 2 min

**T052** [P] Validate FR-002: Non-GET methods return 405
- Test: `curl -X POST http://localhost:3000/status`
- **Expected**: HTTP 405 Method Not Allowed
- **Dependencies**: T050
- **Duration**: 2 min

**T053** [P] Validate FR-007: Port 3000
- Test: Server listening on port 3000
- **Expected**: `netstat -an | grep 3000` shows LISTEN
- **Dependencies**: T050
- **Duration**: 1 min

**T054** [P] Validate FR-011: Query params/headers ignored
- Test: `curl "http://localhost:3000/status?foo=bar" -H "X-Custom: value"`
- **Expected**: Same 200 OK response, params/headers ignored
- **Dependencies**: T050
- **Duration**: 2 min

**T055** [P] Validate FR-010: Concurrent request handling
- Test: Send 100 concurrent requests
- **Expected**: All return 200 OK, no rate limiting
- **Dependencies**: T050
- **Duration**: 3 min

### Performance Validation

**T056** Validate response time < 50ms (p95)
- Test: Load test with 1000 requests, measure p95 latency
- Tool: `ab -n 1000 -c 10 http://localhost:3000/status`
- **Expected**: p95 < 50ms
- **Dependencies**: T050
- **Duration**: 5 min

### Docker Validation

**T057** Validate Docker image builds successfully
- Command: `docker build -t health-check:test .`
- **Expected**: Build succeeds, no errors
- **Dependencies**: T039
- **Duration**: 2 min

**T058** Validate Docker container runs and health check works
- Commands:
  - `docker run -d -p 3001:3000 --name test-container health-check:test`
  - `curl http://localhost:3001/status` (validate endpoint works)
  - Wait 35 seconds for health check to complete
  - `docker inspect --format='{{.State.Health.Status}}' test-container` (should be "healthy")
  - `docker logs test-container` (verify startup logs)
  - `docker stop test-container && docker rm test-container`
- **Expected**: Container runs, /status responds, health check passes, graceful shutdown
- **Dependencies**: T057
- **Duration**: 8 min

### Documentation Validation

**T060** [P] Validate README completeness
- Review: README.md has all required sections
- **Expected**: Installation, usage, testing, Docker, API, architecture, env vars
- **Dependencies**: T041
- **Duration**: 5 min

**T061** [P] Validate quickstart guide works
- Test: Follow steps in `specs/001-create-basic-server/quickstart.md`
- **Expected**: All commands work, final validation passes
- **Dependencies**: T060
- **Duration**: 10 min

**T064** Validate FR-008: No logging for /status endpoint
- Start server with logging enabled: `NODE_ENV=development npm start`
- Monitor logs in separate terminal: `tail -f logs/app.log` (or check console output)
- Send multiple requests: `for i in {1..10}; do curl http://localhost:3000/status; done`
- **Expected**: No log entries for /status requests (server startup/shutdown logs OK)
- Verify other endpoints DO log (if any exist)
- Stop server
- **Dependencies**: T050 (production server validated)
- **Duration**: 5 min
- **Success**: /status requests produce zero log entries

### Final Validation

**T062** Run all quality checks in parallel
- Commands (run simultaneously):
  - `npm run lint`
  - `npm run type-check`
  - `npm run test:coverage`
- **Expected**: All pass with zero errors
- **Dependencies**: T044-T048.5
- **Duration**: 3 min

**T063** Final acceptance checklist
- Verify:
  - [ ] All tests pass (100%)
  - [ ] Coverage ≥80% (all metrics)
  - [ ] Testing pyramid: ~70/20/10 distribution
  - [ ] ESLint: 0 errors
  - [ ] Prettier: formatted
  - [ ] TypeScript: 0 type errors
  - [ ] TSDoc: all exports documented
  - [ ] Production build works
  - [ ] Docker deployment works
  - [ ] All 11 FRs validated (FR-001 to FR-011)
  - [ ] Performance: p95 < 50ms
  - [ ] Documentation complete (README, ADRs, Architecture)
  - [ ] Quickstart guide validated
- **Expected**: All checklist items pass
- **Dependencies**: T044-T064 (all validation tasks)
- **Duration**: 5 min

---

## Dependencies

### Critical Path (Sequential - MUST follow order)
```
T001 → T002-T006 → T007-T017 → T018-T028 → T029-T037 → T038-T040 → T041-T043 → T044-T063
```

### Hard Dependencies
- **Setup**: T001 must complete before all other tasks
- **TDD**: All tests (T018-T028) BEFORE implementation (T029-T037)
- **Layers**: Shared (T029-T031) → Infrastructure (T032-T036)
- **Validation**: Implementation (T037) before validation (T044-T063)

### Parallel Groups
- **T007-T015**: All config files (after T001-T006)
- **T020-T026**: All contract tests (after T019)
- **T029-T031**: Shared layer files (independent)
- **T041-T043**: Documentation files (independent)
- **T044-T046**: Code quality checks (independent)
- **T051-T055**: FR validation tests (independent)

---

## Execution Summary

**Total Tasks**: 71 (63 original + 8 quality enhancements)
**Estimated Duration**: 9-13 hours
**Parallel Opportunities**: ~29 tasks can run in parallel
**Time Savings**: ~30% with parallelization

**New Tasks Added**:
- T012.5: Commitlint configuration (constitutional requirement)
- T037.5: TSDoc documentation validation
- T043.5-T043.8: Architecture Decision Records (4 ADRs)
- T048.5: Testing pyramid distribution validation
- T064: FR-008 logging validation

**Success Criteria**:
- ✅ All 71 tasks completed
- ✅ All tests pass (100% pass rate)
- ✅ Coverage ≥80% (enforced via Vitest config)
- ✅ Testing pyramid: 70/20/10 distribution validated
- ✅ All 11 functional requirements validated (including FR-008)
- ✅ TSDoc documentation complete
- ✅ ADRs created for major decisions
- ✅ Commitlint configured (constitutional requirement)
- ✅ Docker deployment works with health checks
- ✅ Documentation complete (README, ADRs, Architecture)
- ✅ Ready for merge to main

**Validation Gate**: Task T063 is the final gate - all checklist items must pass before feature is considered complete.

---

*Tasks generated: 2025-10-05*
*Updated: 2025-10-05 (added quality enhancements and constitutional compliance fixes per /analyze feedback)*
*Based on Constitution v1.0.0 and TDD principles*
*Ready for execution - follow task order for optimal results*
