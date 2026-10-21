import { app } from "./http.js";

// On Vercel the exported app is used as a serverless function; locally we listen on a port.
if (!process.env.VERCEL) {
  const port = Number(process.env.PORT) || 4000;
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}

export default app;
