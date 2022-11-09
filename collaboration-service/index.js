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
import { CREATE_PATH, DELETE_PATH, GET_PATH, UPDATE_PATH } from "./config.js";
import { YSocketIO } from "y-socket.io/dist/server";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors()); // config cors so that front-end can use
app.options("*", cors());

// Initialize new instance of socket
const httpServer = createServer(app);
const io = new Server(httpServer);
const ysocketio = new YSocketIO(io);
ysocketio.initialize();

ysocketio.on("all-document-connections-closed", (doc) => {
  console.log("all clients dced");
});

// Controller will contain all the User-defined Routes
app.get("/", (_, res) => res.send("Hello World from collab-service"));
app.post(CREATE_PATH, createCollab);
app.delete(DELETE_PATH, deleteCollab);
app.get(GET_PATH, getCollab);
app.put(UPDATE_PATH, updateCollab);

const PORT = process.env.PORT || 8002;
httpServer.listen(PORT, () =>
  console.log(`collaboration-service listening on port ${PORT}`),
);

export default app;
