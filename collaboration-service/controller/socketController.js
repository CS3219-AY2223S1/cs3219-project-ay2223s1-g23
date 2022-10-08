import { deleteOneCollab } from "../model/collab-orm.js";

const socketIdToRoomId = [];

const deleteCollabModel = async (roomId) => {
  try {
    await deleteOneCollab(roomId);
  } catch (err) {
    console.log(err);
  }
};

export const initSocketEventHandlers = (socket, io) => {
  socket.on("join_room", async (data) => {
    await socket.join(data);
    socketIdToRoomId[socket.id] = data;
  });

  socket.on("leave_room", () => {
    socket.disconnect();
  });

  socket.on("send-changes", (data) => {
    io.in(data.roomId).emit("receive-changes", data);
  });

  socket.on("connect_error", function (err) {
    console.log("client connect_error: ", err);
  });

  socket.on("connect_timeout", function (err) {
    console.log("client connect_timeout: ", err);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected, id is: ${socket.id}`);
    const roomId = socketIdToRoomId[socket.id];
    deleteCollabModel(roomId);
    socket.leave(roomId);
  });
};
