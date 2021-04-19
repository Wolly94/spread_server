import express from "express";
import path from "path";
import WebSocket from "ws";

const app = express();

const socketServer = new WebSocket.Server({ port: 3030 });

socketServer.on("connection", (socketClient) => {
  console.log("connected");
  console.log("client Set length: ", socketServer.clients.size);

  socketClient.on("close", (socketClient) => {
    console.log("closed");
    console.log("Number of clients: ", socketServer.clients.size);
  });
});

app.get("/", (req, res) => {
  res.send({ message: "test" });
});

const port = 8765;

app.listen(port, () => {
  console.log(`listening http://localhost:${port}`);
});
