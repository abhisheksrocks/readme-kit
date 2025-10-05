import { describe, it, expect } from 'vitest';
import { buildTestApp } from '../../../../utils/test-app.js';

describe('GET /status - Success Cases', () => {
  it('should return 200 OK with correct JSON response', async () => {
    // Arrange
    const app = await buildTestApp();

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/status',
    });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('should return response matching OpenAPI schema', async () => {
    // Arrange
    const app = await buildTestApp();

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/status',
    });

    const body = response.json();

    // Assert - Validate schema
    expect(body).toHaveProperty('status');
    expect(body.status).toBe('ok');
    expect(Object.keys(body)).toHaveLength(1); // No additional properties
  });
});

describe('GET /status - Query Parameter Handling', () => {
  it('should ignore valid query parameters', async () => {
    // Arrange
    const app = await buildTestApp();

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/status?foo=bar&baz=qux',
    });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('should ignore invalid query parameters', async () => {
    // Arrange
    const app = await buildTestApp();

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/status?invalid[]=malformed&weird@param=value',
    });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });
});

describe('GET /status - Header Handling', () => {
  it('should ignore custom headers', async () => {
    // Arrange
    const app = await buildTestApp();

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/status',
      headers: {
        'X-Custom-Header': 'custom-value',
        Authorization: 'Bearer invalid-token',
        'X-Forwarded-For': '192.168.1.1',
      },
    });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });
});

describe('GET /status - Concurrency', () => {
  it('should handle concurrent requests successfully', async () => {
    // Arrange
    const app = await buildTestApp();

    // Act
    const requests = Array.from({ length: 100 }, () =>
      app.inject({
        method: 'GET',
        url: '/status',
      })
    );

    const responses = await Promise.all(requests);

    // Assert
    responses.forEach((response) => {
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok' });
    });
  });
});

describe('POST /status - Method Not Allowed', () => {
  it('should return 405 for POST requests', async () => {
    // Arrange
    const app = await buildTestApp();

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/status',
      payload: { data: 'test' },
    });

    // Assert
    expect(response.statusCode).toBe(405);
  });
});

describe('PUT /status - Method Not Allowed', () => {
  it('should return 405 for PUT requests', async () => {
    // Arrange
    const app = await buildTestApp();

    // Act
    const response = await app.inject({
      method: 'PUT',
      url: '/status',
      payload: { status: 'modified' },
    });

    // Assert
    expect(response.statusCode).toBe(405);
  });
});

describe('DELETE /status - Method Not Allowed', () => {
  it('should return 405 for DELETE requests', async () => {
    // Arrange
    const app = await buildTestApp();

    // Act
    const response = await app.inject({
      method: 'DELETE',
      url: '/status',
    });

    // Assert
    expect(response.statusCode).toBe(405);
  });
});

describe('PATCH /status - Method Not Allowed', () => {
  it('should return 405 for PATCH requests', async () => {
    // Arrange
    const app = await buildTestApp();

    // Act
    const response = await app.inject({
      method: 'PATCH',
      url: '/status',
      payload: [{ op: 'replace', path: '/status', value: 'modified' }],
    });

    // Assert
    expect(response.statusCode).toBe(405);
  });
});

describe('Error Handling - Invalid Routes', () => {
  it('should return 404 for non-existent routes', async () => {
    // Arrange
    const app = await buildTestApp();

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/invalid-route',
    });

    // Assert
    expect(response.statusCode).toBe(404);
  });
});

describe('Performance - Response Time', () => {
  it('should respond within 50ms (p95)', async () => {
    // Arrange
    const app = await buildTestApp();
    const timings: number[] = [];

    // Act
    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      await app.inject({
        method: 'GET',
        url: '/status',
      });
      const duration = performance.now() - start;
      timings.push(duration);
    }

    // Assert
    timings.sort((a, b) => a - b);
    const p95 = timings[Math.floor(timings.length * 0.95)];

    expect(p95).toBeLessThan(50);
  });
});
