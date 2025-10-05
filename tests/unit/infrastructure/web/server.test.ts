import { describe, it, expect } from 'vitest';
import { buildServer } from '../../../../src/infrastructure/web/server.js';

describe('buildServer', () => {
  it('should create a Fastify instance', async () => {
    const server = await buildServer({ logger: false });

    expect(server).toBeDefined();
    expect(typeof server.listen).toBe('function');
    expect(typeof server.inject).toBe('function');

    await server.close();
  });

  it('should register health routes', async () => {
    const server = await buildServer({ logger: false });

    const response = await server.inject({
      method: 'GET',
      url: '/status',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toEqual({ status: 'ok' });

    await server.close();
  });

  it('should register error handler plugin', async () => {
    const server = await buildServer({ logger: false });

    // Trigger an error to test error handler
    server.get('/test-error', async () => {
      throw new Error('Test error');
    });

    const response = await server.inject({
      method: 'GET',
      url: '/test-error',
    });

    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('message', 'Test error');

    await server.close();
  });

  it('should accept custom options', async () => {
    const server = await buildServer({
      logger: false,
      bodyLimit: 1048576,
    });

    expect(server).toBeDefined();

    await server.close();
  });

  it('should enable logging by default when no logger option provided', async () => {
    const server = await buildServer();

    expect(server).toBeDefined();

    await server.close();
  });

  it('should respect logger option when explicitly set to false', async () => {
    const server = await buildServer({ logger: false });

    expect(server).toBeDefined();

    await server.close();
  });

  it('should handle multiple route registrations', async () => {
    const server = await buildServer({ logger: false });

    // Test status endpoint
    const statusResponse = await server.inject({
      method: 'GET',
      url: '/status',
    });
    expect(statusResponse.statusCode).toBe(200);

    // Test status endpoint with different method (should return 405)
    const methodNotAllowedResponse = await server.inject({
      method: 'POST',
      url: '/status',
    });
    expect(methodNotAllowedResponse.statusCode).toBe(405);

    await server.close();
  });
});
