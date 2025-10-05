# Quickstart Guide: Basic Health Check Server

**Feature**: Basic Health Check Server
**Branch**: 001-create-basic-server
**Date**: 2025-10-05

## Overview

This quickstart guide provides step-by-step instructions to set up, run, and test the basic health check server. Follow these instructions to verify that the implementation meets all feature requirements.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: ≥20.0.0 LTS
  ```bash
  node --version  # Should output v20.x.x or higher
  ```

- **npm**: ≥10.0.0
  ```bash
  npm --version   # Should output 10.x.x or higher
  ```

- **Docker**: Latest version (for containerized deployment)
  ```bash
  docker --version
  ```

- **Docker Compose**: Latest version (optional, for orchestration)
  ```bash
  docker-compose --version
  ```

## Initial Setup

### 1. Clone and Navigate to Repository

```bash
# Navigate to repository root
cd /Users/abhishek/Documents/Personal/readme-kit

# Checkout feature branch
git checkout 001-create-basic-server
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install

# Verify installation
npm list --depth=0
```

Expected dependencies:
- `fastify` (^5.6.1)
- `typescript` (^5.5.0)
- `vitest` (^3.2.0)
- And others as defined in package.json

### 3. Configure Environment

```bash
# Create .env file (if needed for configuration)
cat > .env << EOF
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
EOF
```

**Note**: The server uses fixed port 3000 per specification, but environment variables allow for flexibility in different environments.

## Development Workflow

### 1. Build TypeScript Code

```bash
# Compile TypeScript to JavaScript
npm run build

# Output should be in dist/ directory
ls -la dist/
```

Expected output structure:
```
dist/
├── domain/
├── application/
├── infrastructure/
├── shared/
└── main.js
```

### 2. Run in Development Mode

```bash
# Start server with hot-reload (if configured)
npm run dev

# Or run compiled code
npm start
```

Expected console output:
```
Server listening on http://0.0.0.0:3000
```

### 3. Verify Server is Running

Open a new terminal and test the health endpoint:

```bash
# Test with curl
curl http://localhost:3000/status

# Expected response:
# {"status":"ok"}

# Test with full headers
curl -i http://localhost:3000/status

# Expected response:
# HTTP/1.1 200 OK
# content-type: application/json; charset=utf-8
# content-length: 15
#
# {"status":"ok"}
```

## Testing

### 1. Run All Tests

```bash
# Run complete test suite
npm test

# Expected output: All tests passing
```

### 2. Run Tests with Coverage

```bash
# Generate coverage report
npm run test:coverage

# View coverage summary in terminal
# Full report available in coverage/index.html
```

**Coverage Requirements** (must meet or exceed):
- Lines: ≥80%
- Functions: ≥80%
- Branches: ≥80%
- Statements: ≥80%

### 3. Run Specific Test Suites

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

### 4. Watch Mode (Development)

```bash
# Run tests in watch mode
npm run test:watch

# Tests re-run automatically on file changes
```

## Docker Deployment

### 1. Build Docker Image

```bash
# Build production image
docker build -t health-check-server:latest .

# Verify image was created
docker images | grep health-check-server
```

Expected output:
```
health-check-server  latest  <IMAGE_ID>  <TIME>  <SIZE>
```

### 2. Run Docker Container

```bash
# Run container
docker run -d \
  --name health-check-server \
  -p 3000:3000 \
  health-check-server:latest

# Verify container is running
docker ps | grep health-check-server
```

### 3. Test Dockerized Service

```bash
# Test health endpoint
curl http://localhost:3000/status

# Expected response:
# {"status":"ok"}

# Check container logs
docker logs health-check-server

# Stop container
docker stop health-check-server

# Remove container
docker rm health-check-server
```

### 4. Using Docker Compose

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

## Functional Validation

### Test Case 1: GET Request Success

**Test**:
```bash
curl -X GET http://localhost:3000/status
```

**Expected**:
- HTTP 200 OK
- JSON response: `{"status":"ok"}`
- Content-Type: application/json

### Test Case 2: POST Request Returns 405

**Test**:
```bash
curl -X POST http://localhost:3000/status \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

**Expected**:
- HTTP 405 Method Not Allowed
- Error response matching error schema

### Test Case 3: PUT Request Returns 405

**Test**:
```bash
curl -X PUT http://localhost:3000/status \
  -H "Content-Type: application/json" \
  -d '{"status":"modified"}'
```

**Expected**:
- HTTP 405 Method Not Allowed

### Test Case 4: DELETE Request Returns 405

**Test**:
```bash
curl -X DELETE http://localhost:3000/status
```

**Expected**:
- HTTP 405 Method Not Allowed

### Test Case 5: Query Parameters Ignored

**Test**:
```bash
curl "http://localhost:3000/status?foo=bar&invalid=param"
```

**Expected**:
- HTTP 200 OK
- Same response as without query parameters
- JSON response: `{"status":"ok"}`

### Test Case 6: Custom Headers Ignored

**Test**:
```bash
curl http://localhost:3000/status \
  -H "X-Custom-Header: value" \
  -H "Authorization: Bearer token" \
  -H "X-Forwarded-For: 192.168.1.1"
```

**Expected**:
- HTTP 200 OK
- Headers ignored, normal response returned
- JSON response: `{"status":"ok"}`

### Test Case 7: Concurrent Requests

**Test**:
```bash
# Send 100 concurrent requests
for i in {1..100}; do
  curl -s http://localhost:3000/status &
done
wait

# All should return {"status":"ok"}
```

**Expected**:
- All requests succeed with 200 OK
- No errors or timeouts
- Consistent responses

### Test Case 8: Invalid Route Returns 404

**Test**:
```bash
curl http://localhost:3000/invalid-route
```

**Expected**:
- HTTP 404 Not Found
- Error response

### Test Case 9: Verify No Logging

**Test**:
```bash
# Send request
curl http://localhost:3000/status

# Check logs (should not contain /status request)
docker logs health-check-server
# OR
cat logs/app.log  # If file logging configured
```

**Expected**:
- No log entries for /status endpoint (FR-008 requirement)

## Performance Validation

### Response Time Test

**Test**:
```bash
# Test response time with curl
time curl http://localhost:3000/status

# Or use dedicated tool
ab -n 1000 -c 10 http://localhost:3000/status
```

**Expected**:
- Average response time < 10ms
- P95 response time < 50ms
- No failed requests

### Load Test

**Test**:
```bash
# Install Apache Bench if needed
# brew install apache-bench (macOS)
# apt-get install apache2-utils (Ubuntu)

# Run load test: 10000 requests, 100 concurrent
ab -n 10000 -c 100 http://localhost:3000/status
```

**Expected**:
- 100% success rate
- Requests per second: > 1000 (depending on hardware)
- No errors or timeouts

## Integration with Monitoring Tools

### Kubernetes Liveness Probe

Example Kubernetes configuration:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: health-check-server
spec:
  containers:
  - name: app
    image: health-check-server:latest
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

### Docker Health Check

Example Dockerfile health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/status', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
```

Test Docker health check:

```bash
# Build with healthcheck
docker build -t health-check-server:latest .

# Run container
docker run -d --name test-server health-check-server:latest

# Check health status
docker inspect --format='{{.State.Health.Status}}' test-server

# Expected: "healthy" after startup period
```

## Troubleshooting

### Server Won't Start

**Issue**: Port 3000 already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port (not recommended, violates spec)
PORT=3001 npm start
```

### Tests Failing

**Issue**: Tests fail with "Cannot find module"

```bash
# Rebuild project
npm run build

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Coverage below 80%

```bash
# View detailed coverage report
npm run test:coverage
open coverage/index.html

# Identify untested code
# Add missing tests
```

### Docker Build Fails

**Issue**: TypeScript compilation errors

```bash
# Check TypeScript configuration
npx tsc --noEmit

# Fix type errors
# Rebuild
docker build -t health-check-server:latest .
```

**Issue**: Docker image too large

```bash
# Check image size
docker images health-check-server

# Verify multi-stage build is working
docker history health-check-server:latest

# Should show separate build and runtime stages
```

## Acceptance Criteria Checklist

Verify all feature requirements are met:

- [ ] ✅ **FR-001**: GET /status endpoint exists and responds
- [ ] ✅ **FR-002**: Non-GET methods return 405 Method Not Allowed
- [ ] ✅ **FR-003**: Successful requests return 200 OK
- [ ] ✅ **FR-004**: Response is JSON: `{"status": "ok"}`
- [ ] ✅ **FR-005**: Runs in Docker container
- [ ] ✅ **FR-006**: Starts without external services
- [ ] ✅ **FR-007**: Listens on port 3000
- [ ] ✅ **FR-008**: No logging for /status requests
- [ ] ✅ **FR-009**: Liveness check only (no external dependencies)
- [ ] ✅ **FR-010**: No rate limiting
- [ ] ✅ **FR-011**: Ignores invalid query parameters/headers

## Next Steps

After completing this quickstart:

1. **Development**: Implement additional features
2. **Deployment**: Deploy to staging/production environment
3. **Monitoring**: Set up monitoring and alerting
4. **Documentation**: Update API documentation
5. **CI/CD**: Configure automated deployment pipeline

## Support

For issues or questions:
- Check feature specification: `specs/001-create-basic-server/spec.md`
- Review implementation plan: `specs/001-create-basic-server/plan.md`
- Consult API contracts: `specs/001-create-basic-server/contracts/openapi.yaml`

---
*Quickstart guide created: 2025-10-05*
*Validates all functional requirements from spec.md*
