import MatchModel from "../../MatchModel.js";
import { ormDeleteUserDifficulty } from "../model/match-orm.js";
import { updateUserDifficulty } from "../model/repository.js";

// Stores socket.id and user id of a user finding a match.
// Use queue to handle the case when 2 users join and request at the same time to match with 1 existing user.
const findingMatchQueue = {
  easy: [],
  medium: [],
  hard: [],
};

const updateMatchedUser = async (userIdFromQueue, matchedUserId) => {

  // const userDifficulty = await MatchModel.findOne({
  //   where: { userId: userIdFromQueue },
  // });
  // userDifficulty.matchedUser = matchedUserId;
  // await userDifficulty.save();

  try {
    // Update matchedUser value of the user in the queue
    await updateUserDifficulty(userIdFromQueue, { matchedUser: matchedUserId });

    // Delete the newer user's match model
    deleteMatchModel(matchedUserId);
  } catch (err) {
    console.log(err);
  }
};

const deleteMatchModel = async (userId) => {
  try {
    await ormDeleteUserDifficulty(userId);
  } catch (err) {
    console.log(err);
  }
};

export const initSocketEventHandlers = (socket, io) => {
  socket.on("find_match", (data) => {
    const { userId, difficulty } = data;
    const socketId = socket.id;

    if (findingMatchQueue[difficulty].length > 0) {
      const userFromQueue = findingMatchQueue[difficulty].shift();
      const { socketId: socketIdFromQueue, userId: userIdFromQueue } =
        userFromQueue;
      const roomId = `${socketId}_${socketIdFromQueue}`;
      const allData = {
        userId1: userId,
        userId2: userIdFromQueue,
        socketId1: socketId,
        socketId2: socketIdFromQueue,
        roomId: roomId,
        difficulty: difficulty,
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

  socket.on("join_room", (data) => {
    socket.join(data);
  });

  socket.on("prep_room", (data) => {
    io.to(data.roomId).emit("welcome_room", data);
  });

  socket.on("stop_find_match", (data) => {
    const { userId, difficulty } = data;
    findingMatchQueue[difficulty] = findingMatchQueue[difficulty].filter(
      (user) => user.userId != userId,
    );
    deleteMatchModel(userId);
  });

  socket.on("leave_room", (userId) => {
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
  });
};
