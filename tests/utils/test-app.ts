import { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/infrastructure/web/server.js';

export async function buildTestApp(): Promise<FastifyInstance> {
  const app = await buildServer({
    logger: false,
  });

  await app.ready();
  return app;
}
