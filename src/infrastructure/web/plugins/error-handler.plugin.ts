import { FastifyInstance, FastifyError } from 'fastify';
import fp from 'fastify-plugin';

async function errorHandler(fastify: FastifyInstance): Promise<void> {
  fastify.setErrorHandler((error: FastifyError, _request, reply) => {
    const statusCode = error.statusCode || 500;

    reply.status(statusCode).send({
      statusCode,
      error: error.name || 'Error',
      message: error.message,
    });
  });
}

export default fp(errorHandler);
