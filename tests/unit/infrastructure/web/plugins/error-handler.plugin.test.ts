import { describe, it, expect, beforeEach } from 'vitest';
import Fastify, { FastifyInstance, FastifyError } from 'fastify';
import errorHandler from '../../../../../src/infrastructure/web/plugins/error-handler.plugin.js';

describe('errorHandler plugin', () => {
  let fastify: FastifyInstance;

  beforeEach(async () => {
    fastify = Fastify({ logger: false });
  });

  it('should register without errors', async () => {
    await expect(fastify.register(errorHandler)).resolves.not.toThrow();
  });

  it('should handle errors with status code', async () => {
    await fastify.register(errorHandler);

    fastify.get('/error', async () => {
      const error = new Error('Test error') as FastifyError;
      error.statusCode = 400;
      error.name = 'BadRequestError';
      throw error;
    });

    const response = await fastify.inject({
      method: 'GET',
      url: '/error',
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('statusCode', 400);
    expect(body).toHaveProperty('error', 'BadRequestError');
    expect(body).toHaveProperty('message', 'Test error');
  });

  it('should default to 500 status code when not specified', async () => {
    await fastify.register(errorHandler);

    fastify.get('/error500', async () => {
      throw new Error('Internal error');
    });

    const response = await fastify.inject({
      method: 'GET',
      url: '/error500',
    });

    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('statusCode', 500);
    expect(body).toHaveProperty('message', 'Internal error');
  });

  it('should include error name in response', async () => {
    await fastify.register(errorHandler);

    fastify.get('/named-error', async () => {
      const error = new Error('Named error') as FastifyError;
      error.name = 'CustomError';
      error.statusCode = 422;
      throw error;
    });

    const response = await fastify.inject({
      method: 'GET',
      url: '/named-error',
    });

    const body = JSON.parse(response.body);
    expect(body.error).toBe('CustomError');
  });

  it('should default to Error name when not specified', async () => {
    await fastify.register(errorHandler);

    fastify.get('/unnamed-error', async () => {
      const error = new Error('Unnamed error') as FastifyError;
      error.name = '';
      error.statusCode = 400;
      throw error;
    });

    const response = await fastify.inject({
      method: 'GET',
      url: '/unnamed-error',
    });

    const body = JSON.parse(response.body);
    expect(body.error).toBe('Error');
  });
});
