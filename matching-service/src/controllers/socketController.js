import { URL_QUES, URL_HISTORY } from "../../configs.js";
import { deleteOneMatchModel } from "../model/match-orm.js";
import { updateMatchModel } from "../model/repository.js";
import axios from "axios";

// Stores socket.id and user id of a user finding a match.
// Use queue to handle the case when 2 users join and request at the same time to match with 1 existing user.
const findingMatchQueue = {
  easy: [],
  medium: [],
  hard: [],
};

const socketIdToUserId = [];

const updateMatchedUser = async (userIdFromQueue, matchedUserId) => {
  try {
    // Update matchedUser value of the user in the queue
    await updateMatchModel(userIdFromQueue, { matchedUser: matchedUserId });

    // Delete the newer user's match model
    deleteMatchModel(matchedUserId);
  } catch (err) {
    console.log(err);
  }
};

const fetchQuestion = async (_difficulty) => {
  try {
    const res = await axios.get(`${URL_QUES}/diff`, {
      params: { diff: _difficulty },
    });
    //console.log(res.data);
    return res.data.data;
  } catch (err) {
    console.log("error in fetching question: " + err);
    return null;
  }
};

const createHistory = async (user1, user2, quesId) => {
  try {
    const hist = await axios.post(`${URL_HISTORY}`, {
      quesId: quesId,
      userId1: user1,
      userId2: user2,
    });
    return hist.data.data;
  } catch (err) {
    console.log("error in creating hist: " + err);
    return null;
  }
};

const deleteMatchModel = async (userId) => {
  try {
    await deleteOneMatchModel(userId);
  } catch (err) {
    console.log(err);
  }
};

export const initSocketEventHandlers = (socket, io) => {
  socket.on("find_match", async (data) => {
    const { userId, difficulty } = data;
    const socketId = socket.id;
    socketIdToUserId[socketId] = userId;

    if (!findingMatchQueue[difficulty]) {
      findingMatchQueue[difficulty] = [];
    }

    if (findingMatchQueue[difficulty].length > 0) {
      // find a ques
      const ques = await fetchQuestion(difficulty);

      const userFromQueue = findingMatchQueue[difficulty].shift();
      const { socketId: socketIdFromQueue, userId: userIdFromQueue } =
        userFromQueue;

      // create 1 history model
      const hist = await createHistory(userId, userIdFromQueue, ques._id);

      const roomId = `${socketId}_${socketIdFromQueue}`;
      const allData = {
        userId1: userId,
        userId2: userIdFromQueue,
        socketId1: socketId,
        socketId2: socketIdFromQueue,
        roomId: roomId,
        difficulty: difficulty,
        quesId: ques._id,
        histId: hist._id,
      };

      // Emit successful match to both users.
      socket.to(socketIdFromQueue).emit("match_success", allData);
      socket.emit("match_success", allData);

      // Update matchModels in the db.
      updateMatchedUser(userIdFromQueue, userId);
    } else {
      findingMatchQueue[difficulty].push({
        socketId: socketId,
        userId: userId,
      });
    }
  });

  socket.on("clean_up", async (data) => {
    socket.disconnect();
  });

  socket.on("stop_find_match", (data) => {
    const { userId, difficulty } = data;
    findingMatchQueue[difficulty] = findingMatchQueue[difficulty].filter(
      (user) => user.userId != userId,
    );
    deleteMatchModel(userId);
  });

  socket.on("connect_error", function (err) {
    console.log("client connect_error: ", err);
  });

  socket.on("connect_timeout", function (err) {
    console.log("client connect_timeout: ", err);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected, id is: ${socket.id}`);
    // if not deleted, delete userId from db and queue
    const userId = socketIdToUserId[socket.id];
    deleteMatchModel(userId);
    const diffs = ["easy", "medium", "hard"];
    for (let i = 0; i < diffs.length; i++) {
      findingMatchQueue[diffs[i]] = findingMatchQueue[diffs[i]].filter(
        (user) => user.userId != userId,
      );
    }
  });
};
