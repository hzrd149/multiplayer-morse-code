const express = require("express");
const { WebSocketServer } = require("ws");

const app = express();
const port = 3000;

app.use("/", express.static("./public"));

const server = app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});

const sockets = new Set();
const wss = new WebSocketServer({ server });
wss.on("connection", function connection(ws) {
  sockets.add(ws);

  ws.on("message", (data) => {
    const value = data.toString();
    for (const other of sockets) {
      if (other !== ws) other.send(value);
    }
  });

  ws.on("close", () => sockets.delete(ws));
});

const close = () => {
  console.log("closing server");
  for (const ws of sockets) {
    ws.close();
  }
  server.close();
  process.exit();
};
process.on("SIGINT", close);
process.on("SIGTERM", close);
