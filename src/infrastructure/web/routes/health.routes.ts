import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { healthController } from '../controllers/health.controller.js';

/**
 * Registers health check routes on the Fastify instance.
 *
 * This function sets up the `/status` endpoint for health monitoring, including:
 * - GET handler that returns service health status
 * - Response schema validation for type safety
 * - Method restriction handlers (405 for POST, PUT, DELETE, PATCH)
 *
 * @param fastify - The Fastify instance to register routes on.
 * @returns A promise that resolves when all routes are successfully registered.
 *
 * @example
 * ```typescript
 * const app = Fastify();
 * await app.register(healthRoutes);
 * // GET /status returns { status: 'ok' }
 * // POST /status returns 405 Method Not Allowed
 * ```
 */
export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get(
    '/status',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string', const: 'ok' },
            },
            required: ['status'],
          },
        },
      },
    },
    healthController
  );

  // Handle non-GET methods with 405 Method Not Allowed
  const methodNotAllowedHandler = async (
    _request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    await reply.status(405).send({
      statusCode: 405,
      error: 'Method Not Allowed',
      message: 'GET method required for /status endpoint',
    });
  };

  fastify.post('/status', methodNotAllowedHandler);
  fastify.put('/status', methodNotAllowedHandler);
  fastify.delete('/status', methodNotAllowedHandler);
  fastify.patch('/status', methodNotAllowedHandler);
}
