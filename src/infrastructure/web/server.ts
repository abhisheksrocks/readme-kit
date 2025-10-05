import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { healthRoutes } from './routes/health.routes.js';
import errorHandler from './plugins/error-handler.plugin.js';

/**
 * Builds and configures a Fastify server instance with all necessary plugins and routes.
 *
 * This function creates a new Fastify instance with the provided options, registers
 * the error handling plugin, and sets up all application routes including health checks.
 *
 * @param opts - Optional Fastify server configuration options. Defaults to enabling logging.
 * @returns A promise that resolves to a configured Fastify instance ready to be started.
 *
 * @example
 * ```typescript
 * const server = await buildServer({ logger: true });
 * await server.listen({ port: 3000, host: '0.0.0.0' });
 * ```
 *
 * @example
 * ```typescript
 * // Custom configuration
 * const server = await buildServer({
 *   logger: { level: 'debug' },
 *   bodyLimit: 1048576
 * });
 * ```
 */
export async function buildServer(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: opts.logger ?? true,
    ...opts,
  });

  await fastify.register(errorHandler);
  await fastify.register(healthRoutes);

  return fastify;
}
