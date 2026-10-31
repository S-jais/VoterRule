import { buildApp } from './app.js';
import { loadConfig } from './config.js';

async function startServer() {
  const config = loadConfig();
  const { app } = await buildApp(config);

  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`================================================================`);
    console.log(`  VOTERRULE API SERVER RUNNING ON PORT ${config.port}`);
    console.log(`  Mode: ${config.appMode.toUpperCase()}`);
    console.log(`  OpenAPI Documentation: http://localhost:${config.port}/api/docs`);
    console.log(`================================================================`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
