import express from "express";
import cors from "cors";
import { createServer } from "http";
// import { createMatch } from "./src/controllers/match-controller.js";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // middleware
app.use(cors()); // config cors so that front-end can use
app.options("*", cors());

const httpServer = createServer(app);

// Routes Section

app.get("/", (req, res) => {
    res.send("Hello World from question service");
});
// app.post("/difficulties", createMatch);

httpServer.listen(8002, () => {
    console.log("server listening on port 8002");
});
