import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocketEventHandlers } from "./src/controllers/socketController.js";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // middleware
app.use(cors()); // config cors so that front-end can use
app.options("*", cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET"],
  },
});

app.get("/", (_req, res) => {
  res.send("Hello World from communication-service");
});

io.on("connection", function (socket) {
  initSocketEventHandlers(socket, io);
});

httpServer.listen(8003, () => {
  console.log("Communication service listening on port 8003");
});
