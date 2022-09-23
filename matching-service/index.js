import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocketEventHandlers } from "./src/controllers/socketController.js";
import { createUserDifficulty } from "./src/controllers/match-controller.js";

// Initialize express

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // middleware
app.use(cors()); // config cors so that front-end can use
app.options("*", cors());

// Initialize new instance of socket

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected with ID: ${socket.id}`);
  initSocketEventHandlers(socket, io);
});

// Routes Section

app.get("/", (req, res) => {
  res.send("Hello World from matching-service");
});

// app.get("/difficulties", getUserDifficulties);
app.post("/difficulties", createUserDifficulty);
// app.get("/difficulties/:id", getUserDifficultyById);

// Configure the port

httpServer.listen(8001, () => {
  console.log("server listening on port 8001");
});
