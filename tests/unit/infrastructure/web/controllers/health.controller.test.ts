import { describe, it, expect } from 'vitest';
import { healthController } from '../../../../../src/infrastructure/web/controllers/health.controller.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

describe('healthController', () => {
  it('should return health status ok', async () => {
    const mockRequest = {} as FastifyRequest;
    const mockReply = {} as FastifyReply;

    const result = await healthController(mockRequest, mockReply);

    expect(result).toEqual({ status: 'ok' });
  });

  it('should return an object with status property', async () => {
    const mockRequest = {} as FastifyRequest;
    const mockReply = {} as FastifyReply;

    const result = await healthController(mockRequest, mockReply);

    expect(result).toHaveProperty('status');
    expect(typeof result.status).toBe('string');
  });

  it('should always return ok status', async () => {
    const mockRequest = {} as FastifyRequest;
    const mockReply = {} as FastifyReply;

    // Call multiple times to ensure consistency
    const result1 = await healthController(mockRequest, mockReply);
    const result2 = await healthController(mockRequest, mockReply);
    const result3 = await healthController(mockRequest, mockReply);

    expect(result1.status).toBe('ok');
    expect(result2.status).toBe('ok');
    expect(result3.status).toBe('ok');
  });

  it('should not modify request or reply objects', async () => {
    const mockRequest = {} as FastifyRequest;
    const mockReply = {} as FastifyReply;

    await healthController(mockRequest, mockReply);

    expect(mockRequest).toEqual({});
    expect(mockReply).toEqual({});
  });
});
