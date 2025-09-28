import { validateConfig } from './config.js';
import { App } from './app.js';

// Validate configuration on startup
validateConfig();

// Create and start the application
const app = new App();
app.start().catch((error) => {
  console.error('Fatal start error', error);
  process.exit(1);
});