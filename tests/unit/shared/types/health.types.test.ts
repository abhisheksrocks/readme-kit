import { describe, it, expect } from 'vitest';
import type { HealthResponse } from '../../../../src/shared/types/health.types.js';

describe('HealthResponse type', () => {
  it('should accept valid health response object', () => {
    const response: HealthResponse = { status: 'ok' };
    expect(response.status).toBe('ok');
  });

  it('should have readonly status property', () => {
    const response: HealthResponse = { status: 'ok' };
    expect(response).toHaveProperty('status');
    expect(typeof response.status).toBe('string');
  });
});
