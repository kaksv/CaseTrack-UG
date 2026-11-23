import { app } from './app';
import { connectDatabase, disconnectDatabase } from './db';
import { env } from './config';

async function main(): Promise<void> {
  await connectDatabase(env.MONGODB_URI);

  const server = app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`CaseTrack UG API listening on port ${env.PORT} (${env.NODE_ENV})`);
  });

  let shuttingDown = false;
  const shutdown = async (signal: string, exitCode = 0): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received — shutting down`);

    const forceTimer = setTimeout(() => {
      console.error('Shutdown timed out');
      process.exit(1);
    }, 10_000);
    forceTimer.unref();

    server.close(async () => {
      try {
        await disconnectDatabase();
      } finally {
        clearTimeout(forceTimer);
        process.exit(exitCode);
      }
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason instanceof Error ? reason.message : 'unknown');
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error.message);
    void shutdown('uncaughtException', 1);
  });
}

main().catch((error) => {
  console.error('Failed to start API:', error instanceof Error ? error.message : 'unknown error');
  process.exit(1);
});
