require("dotenv").config({ path: ".env" });
const express = require("express");
const _ = require("lodash");
const http = require("http");
const DashaApplication = require("./dasha-application");
const { Server } = require("socket.io");

const DASHA_SERVER = process.env.DASHA_SERVER;
const DASHA_APIKEY = process.env.DASHA_APIKEY;
const DASHA_CONCURRENCY = process.env.DASHA_CONCURRENCY;

const PORT = "8080";

function createExpressApp() {
  const app = express();
  const viewsDir = __dirname + "/views";
  app.use(express.static(viewsDir));
  app.set("views", viewsDir);
  app.engine("html", require("ejs").renderFile);
  app.set("view engine", "ejs");

  app.use(
    express.json({ type: ["application/json", "application/json-patch+json"] })
  );

  app.use((req, res, next) => {
    if (_.isNil(DASHA_SERVER))
      throw new Error("Variable DASHA_SERVER is not set in the environment");
    if (_.isNil(DASHA_APIKEY))
      throw new Error("Variable DASHA_APIKEY is not set in the environment");
    next();
  });

  app.get("/", (req, res) => {
    res.render("base.html");
  });

  app.get("/health", (req, res) => {
    console.log("got request healthcheck");
    return res.status(200).send("OK");
  });

  return app;
}

async function main() {
  const dashaApp = new DashaApplication(
    DASHA_SERVER,
    DASHA_APIKEY
  );
  const app = createExpressApp();
  await dashaApp.start(DASHA_CONCURRENCY ?? 2);
  const httpServer = http.createServer(app);

  const io = new Server(httpServer);
  io.on("connection", (socket) => {
    console.log("user connected, socket id:", socket.id);

    socket.on("debug", (msg) => {
      console.log(`[debug:${socket.id}] ${msg}`);
    });

    socket.on("system-start-conv", async (data) => {
      const {convId} = data;
      console.log(`starting conversation for user '${socket.id}'`);
      await dashaApp.executeSingleConversation(socket, convId, { endpoint: "chat" });
    });

    socket.on("disconnect", function (s) {
      console.log(`user '${socket.id}' disconnected`);
    });
  });

  httpServer
    .listen(PORT)
    .on("listening", () => {
      console.log(`Web server listening on http://localhost:${PORT}`);
    })
    .on("error", (err) => {
      console.log(`Failed to open port ${PORT}: ${err}`);
      process.exit(1);
    });
}

main();
