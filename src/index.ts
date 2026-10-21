import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

// On Vercel the exported app runs as a serverless function; elsewhere (local, Render) we listen on a port.
if (!env.isServerless) {
  app.listen(env.port, () => console.log(`API listening on http://localhost:${env.port}`));
}

export default app;
