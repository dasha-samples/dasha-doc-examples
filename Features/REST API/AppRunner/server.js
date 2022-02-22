require("dotenv").config({ path: ".env" });
const express = require("express");
const _ = require("lodash");
const axios = require("axios");
const http = require("http");

const PORT = process.env.PORT ?? "8080";

function checkEnvironment(req, res, next) {
  next();
}

function createApp() {
  const app = express();
  app.use(
    express.json({ type: ["application/json", "application/json-patch+json"] })
  );

  app.use(checkEnvironment);

  app.get("/health", (req, res) => {
    console.log("got request healthcheck");
    return res.status(200).send("OK");
  });

  app.post("/completed", (req, res) => {
    console.log("Got post completed", req.body);
    return res.sendStatus(200);
  });

  app.post("/failed", (req, res) => {
    console.log("Got post failed", req.body);
    return res.sendStatus(200);
  });

  app.post("/myfunc_external_impl", (req, res) => {
    console.log("Got post external", req.body);
    return res.status(200).send("1122");
  });

  return app;
}

async function main() {
  const app = createApp();
  const httpServer = http.createServer(app);
  httpServer
    .listen(PORT)
    .on("listening", () => {
      console.log(`Web server listening on localhost:${PORT}`);
    })
    .on("error", (err) => {
      console.log(`Failed to open port ${PORT}: ${err}`);
      process.exit(1);
    });
}

main();
