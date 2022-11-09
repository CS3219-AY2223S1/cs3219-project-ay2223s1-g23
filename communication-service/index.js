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
    origin: process.env.URI_FRONTEND || "http://localhost:3000",
    methods: ["GET"],
  },
});

app.get("/", (_req, res) => {
  res.send("Hello World from communication-service");
});

io.on("connection", function (socket) {
  initSocketEventHandlers(socket);
});

const PORT = process.env.PORT || 8003;
httpServer.listen(PORT, () => {
  console.log(`Communication service listening on port ${PORT}`);
});
