import express from "express";
import cors from "cors";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors()); // config cors so that front-end can use
app.options("*", cors());
import {
  createCollab,
  deleteCollab,
  getCollab,
  updateCollab,
} from "./controller/collab-controller.js";

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

app.listen(8002, () => console.log("user-service listening on port 8002"));
