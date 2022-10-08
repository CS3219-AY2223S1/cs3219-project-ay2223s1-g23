import express from "express";
import cors from "cors";
import {
  createCollab,
  deleteCollab,
  getCollab,
  updateCollab,
} from "./controller/collab-controller.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocketEventHandlers } from "./controller/socketController.js";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors()); // config cors so that front-end can use
app.options("*", cors());

// Initialize new instance of socket
const httpServer = createServer(app);
const io = new Server(httpServer, {
  path: "/room",
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => {
  console.log(`User connected collab-service with socket ID: ${socket.id}`);
  initSocketEventHandlers(socket, io);
});

// Controller will contain all the User-defined Routes
app.get("/", (_, res) => res.send("Hello World from collab-service"));
app.post("/collab", createCollab);
app.delete("/collab/:roomId", deleteCollab);
app.get("/collab/:roomId", getCollab);
app.put("/collab", updateCollab);

// app.use('/api/user', router).all((_, res) => {
//     res.setHeader('content-type', 'application/json')
//     res.setHeader('Access-Control-Allow-Origin', '*')
// })

httpServer.listen(8002, () =>
  console.log("collaboration-service listening on port 8002"),
);
