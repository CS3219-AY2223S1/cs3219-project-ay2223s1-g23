import express from "express";
import cors from "cors";
import { createServer } from "http";
import {
    createHistory,
    getHistoryById,
    getHistoryByUserId,
    updateHistory
} from "./controllers/history-controller.js";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // middleware
app.use(cors()); // config cors so that front-end can use
app.options("*", cors());

// Routes Section
app.get("/", (req, res) => {
    res.send("Hello World from history service");
});
app.post("/hist", createHistory);
app.get("/hist/id", getHistoryById); // e.g. localhost:8008/h/id?id=1234
app.get("/hist/userId", getHistoryByUserId); // e.g. localhost:8008/h/userId?userId=1234
app.put("/hist", updateHistory)



const httpServer = createServer(app);

const PORT = process.env.PORT || 8008;
httpServer.listen(PORT, () => {
    console.log(`history server listening on port ${PORT}`);
});

export default app;

