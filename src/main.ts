import { buildServer } from './infrastructure/web/server.js';
import { config } from './infrastructure/config/environment.js';

const start = async (): Promise<void> => {
  try {
    const server = await buildServer();

    await server.listen({
      port: config.port,
      host: config.host,
    });

    const signals = ['SIGINT', 'SIGTERM'] as const;

    for (const signal of signals) {
      process.on(signal, async () => {
        console.log(`Received ${signal}, closing server gracefully...`);
        await server.close();
        process.exit(0);
      });
    }
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

start();
