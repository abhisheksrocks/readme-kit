import { describe, it, expect } from 'vitest';
import { config } from '../../../../src/infrastructure/config/environment.js';

describe('Environment configuration', () => {
  it('should have a port property', () => {
    expect(config.port).toBeDefined();
    expect(typeof config.port).toBe('number');
  });

  it('should parse port as integer', () => {
    expect(Number.isInteger(config.port)).toBe(true);
  });

  it('should have a nodeEnv property', () => {
    expect(config.nodeEnv).toBeDefined();
    expect(typeof config.nodeEnv).toBe('string');
  });

  it('should have a host property', () => {
    expect(config.host).toBeDefined();
    expect(typeof config.host).toBe('string');
  });

  it('should have valid default port range', () => {
    expect(config.port).toBeGreaterThan(0);
    expect(config.port).toBeLessThanOrEqual(65535);
  });

  it('should have correct structure', () => {
    const keys = Object.keys(config);
    expect(keys).toContain('port');
    expect(keys).toContain('nodeEnv');
    expect(keys).toContain('host');
    expect(keys).toHaveLength(3);
  });
});
