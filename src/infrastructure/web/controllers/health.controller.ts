import { FastifyReply, FastifyRequest } from 'fastify';
import { HealthResponse } from '../../../shared/types/health.types.js';

/**
 * Handles health check requests by returning the application's health status.
 *
 * This controller function responds to health check requests with a simple status indicator,
 * which can be used by monitoring systems, load balancers, or orchestration platforms
 * to determine if the service is running properly.
 *
 * @param request - The Fastify request object containing request details.
 * @param reply - The Fastify reply object used to send the response.
 * @returns A promise that resolves to a HealthResponse object indicating the service status.
 *
 * @example
 * ```typescript
 * // Used within Fastify route registration
 * fastify.get('/status', healthController);
 * // Returns: { status: 'ok' }
 * ```
 */
export async function healthController(
  _request: FastifyRequest,
  _reply: FastifyReply
): Promise<HealthResponse> {
  return { status: 'ok' };
}
