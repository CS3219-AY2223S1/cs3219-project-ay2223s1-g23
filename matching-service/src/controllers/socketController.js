// stores socket.id of user
const findingMatchQueue = {
  easy: [],
  medium: [],
  hard: [],
};

export const initSocketEventHandlers = (socket, io) => {
  socket.on("find_match", (data) => {
    const { userId, difficulty } = data;
    const socketId = socket.id;
    console.log(
      `In server (shared): User with socket ID ${socketId}, user ID ${userId} and difficulty ${difficulty} wants to find match`,
    );

    // check findingMatchQueue
    if (findingMatchQueue[difficulty].length > 0) {
      // remove from findingMatchQueue
      const socketIdFromQueue = findingMatchQueue[difficulty].shift();

      const roomId = `${socketId}_${socketIdFromQueue}`;
      // emit other user client to navigate + join room
      socket.to(socketIdFromQueue).emit("match_success", roomId);
      // emit to this user client match_success to navigate + join room
      socket.emit("match_success", roomId);

      // ?? and send welcome message with both userIds and init socket and user ids
      // socket.to(roomId).emit("welcome", {
      //   userId1: userId,
      //   userId2:
      // })

      // update db
    } else {
      // add to findMatchQueue
      findingMatchQueue[difficulty].push(socketId);
    }

    // socket.broadcast.emit("finding_match", {
    //   ...data,
    //   socketId: socket.id,
    // });
  });

  // socket.on("match_found", (data) => {
  //   const { userId, otherUserId, socketUserId, otherSocketUserId } = data;
  //   console.log("match_found event");
  //   // socket
  //   //   .to([socket.id, otherSocketUserId])
  //   //   .emit("join_room", `${userId}_${otherUserId}`);
  //   io.sockets.emit("match_success", {
  //     userId: userId,
  //     otherUserId: otherUserId,
  //     socketUserId: socketUserId,
  //     otherSocketUserId: otherSocketUserId,
  //   });
  //   // socket.emit("join_room", `${userId}_${otherUserId}`);
  //   // socket.to(otherSocketUserId).emit("join_room", `${userId}_${otherUserId}`);
  // });

  socket.on("join_room", (data) => {
    console.log("join_room event");
    // if (data.socketUserId == socket.id || data.otherSocketUserId == socket.id) {
    //   console.log(`Joining room ID ${data.roomId}`);
    //   socket.join(`${data.roomId}`);
    // }
    socket.join(data);
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
