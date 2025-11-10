import "dotenv/config";

import { app } from "./app.js";

const PORT = Number(process.env.PORT);

app
  .listen({
    port: PORT,
    host: "0.0.0.0",
  })
  .then(() => {
    console.log(`HTTP server running on http://localhost:${PORT}`);
  });
