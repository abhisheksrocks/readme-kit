/**
 * Application configuration object loaded from environment variables.
 *
 * This configuration provides centralized access to environment-specific settings
 * with sensible defaults for production deployment. All values are read from
 * process.env at initialization time.
 *
 * Configuration properties:
 * - `port`: The TCP port number the server should listen on (default: 3000)
 * - `nodeEnv`: The current Node.js environment mode (default: 'production')
 * - `host`: The network interface to bind to (default: '0.0.0.0' for all interfaces)
 *
 * @example
 * ```typescript
 * import { config } from './infrastructure/config/environment.js';
 *
 * await server.listen({
 *   port: config.port,
 *   host: config.host
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Environment-based behavior
 * if (config.nodeEnv === 'development') {
 *   console.log('Running in development mode');
 * }
 * ```
 */
export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'production',
  host: process.env.HOST || '0.0.0.0',
} as const;
