const socketToRoom = {};
const socketOnlineStatus = {};

export const initSocketEventHandlers = (socket) => {
  const socketId = socket.id;
  socketToRoom[socketId] = "";
  socketOnlineStatus[socketId] = false;

  socket.on("voice", function (data) {
    if (!socketOnlineStatus[socketId]) {
      console.log(socketOnlineStatus[socketId]);
      console.log(socketId + " is not online");
      return;
    }

    var newData = data.split(";");
    newData[0] = "data:audio/ogg;";
    newData = newData[0] + newData[1];

    const roomId = socketToRoom[socketId];
    console.log("Broadcasting to " + roomId);
    socket.to(roomId).emit("send", newData);
  });

  socket.on("userInfo", function (data) {
    console.log("Data received by " + socketId + ":" + data);
    const { online, roomId } = data;
    if (roomId == "") {
      return;
    }

    socketToRoom[socketId] = roomId;
    socketOnlineStatus[socketId] = online;

    if (online) {
      console.log(socketId + " joined " + roomId);
      socket.join(roomId);
    } else {
      console.log(socketId + " left " + roomId);
      socket.leave(roomId);
    }
  });

  socket.on("disconnect", function () {
    delete socketToRoom[socketId];
    delete socketOnlineStatus[socketId];
  });
};
