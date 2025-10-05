import { describe, it, expect } from 'vitest';
import { HTTP_STATUS } from '../../../../src/shared/constants/http-status.constants.js';

describe('HTTP_STATUS constants', () => {
  it('should have correct OK status code', () => {
    expect(HTTP_STATUS.OK).toBe(200);
  });

  it('should have correct METHOD_NOT_ALLOWED status code', () => {
    expect(HTTP_STATUS.METHOD_NOT_ALLOWED).toBe(405);
  });

  it('should have correct NOT_FOUND status code', () => {
    expect(HTTP_STATUS.NOT_FOUND).toBe(404);
  });

  it('should have correct INTERNAL_SERVER_ERROR status code', () => {
    expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
  });

  it('should have all status codes as numbers', () => {
    expect(typeof HTTP_STATUS.OK).toBe('number');
    expect(typeof HTTP_STATUS.METHOD_NOT_ALLOWED).toBe('number');
    expect(typeof HTTP_STATUS.NOT_FOUND).toBe('number');
    expect(typeof HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe('number');
  });

  it('should have all required HTTP status codes', () => {
    expect(HTTP_STATUS).toHaveProperty('OK');
    expect(HTTP_STATUS).toHaveProperty('METHOD_NOT_ALLOWED');
    expect(HTTP_STATUS).toHaveProperty('NOT_FOUND');
    expect(HTTP_STATUS).toHaveProperty('INTERNAL_SERVER_ERROR');
  });
});
