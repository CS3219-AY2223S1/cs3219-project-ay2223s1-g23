import express from "express";
import cors from "cors";
import { createServer } from "http";
import { createQuestion, getQuestionByDiff, getQuestionById } from "./controllers/question-controller.js";

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
app.get("/q/diff", getQuestionByDiff); // e.g. localhost:8009/q/diff?diff=easy
app.get("/q/id", getQuestionById); // e.g. localhost:8009/q/id?id=1234


const httpServer = createServer(app);
const PORT = process.env.PORT || 8009;
httpServer.listen(PORT, () => {
    console.log(`question server listening on port ${PORT}`);
});

export default app;


