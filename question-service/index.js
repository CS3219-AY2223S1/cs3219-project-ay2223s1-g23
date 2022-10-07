import express from "express";
import cors from "cors";
import { createServer } from "http";
import { createQuestion, getQuestionByDiff } from "./controllers/question-controller.js";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // middleware
app.use(cors()); // config cors so that front-end can use
app.options("*", cors());

// Routes Section
app.get("/", (req, res) => {
    res.send("Hello World from question service");
});
app.post("/q", createQuestion);
app.get("/q/:diff", getQuestionByDiff);


const httpServer = createServer(app);
httpServer.listen(8009, () => {
    console.log("server listening on port 8009");
});


