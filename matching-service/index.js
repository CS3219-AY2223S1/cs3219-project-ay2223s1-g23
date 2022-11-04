import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocketEventHandlers } from "./src/controllers/socketController.js";
import { createMatch } from "./src/controllers/match-controller.js";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // middleware
app.use(cors()); // config cors so that front-end can use
app.options("*", cors());

// Initialize new instance of socket

const httpServer = createServer(app);
const io = new Server(httpServer, {
  path: "/",
  cors: {
    origin: process.env.URI_FRONTEND || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(
    `User connected to matching-service with socket ID: ${socket.id}`,
  );
  initSocketEventHandlers(socket, io);
});

// Routes Section

app.get("/", (req, res) => {
  res.send("Hello World from matching-service");
});
app.post("/difficulties", createMatch);

const PORT = process.env.PORT || 8001;
httpServer.listen(PORT, () => {
  console.log(`matching server listening on port ${PORT}`);
});
