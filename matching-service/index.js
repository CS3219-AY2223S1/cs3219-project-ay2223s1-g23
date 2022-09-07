import express from "express";
import cors from "cors";
import { createServer } from "http";
import sequelize from "./database.js";
import MatchModel from "./MatchModel.js";
import { Server } from "socket.io";
import { initSocketEventHandlers } from "./src/controllers/socketController.js";

// Initialise database

sequelize.sync({ force: true }).then(() => console.log("db is ready"));

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

app.post("/difficulties", async (req, res) => {
  await MatchModel.create(req.body);
  res.status(201).send("user and difficulty are inserted");
});

app.get("/difficulties", async (req, res) => {
  const difficulties = await MatchModel.findAll();
  res.send(difficulties);
});

app.get("/difficulties/:id", async (req, res) => {
  const requestedId = req.params.id;
  const userDifficulty = await MatchModel.findOne({
    where: { id: requestedId },
  });
  res.send(userDifficulty);
});

app.put("/difficulties/:id", async (req, res) => {
  try {
    const requestedId = req.params.id;
    const userDifficulty = await MatchModel.findOne({
      where: { id: requestedId },
    });
    userDifficulty.difficulty = req.body.difficulty;
    await userDifficulty.save();
    res.send("user's difficulty is updated");
  } catch (e) {
    console.log("Catch an error: ", e);
  }
});

app.delete("/difficulties/:id", async (req, res) => {
  const requestedId = req.params.id;
  await MatchModel.destroy({ where: { id: requestedId } });
  res.send("user's difficulty is removed");
});

// Configure the port

httpServer.listen(8001, () => {
  console.log("server listening on port 8001");
});
