import { deleteOneCollab, getOneCollab } from "../model/collab-orm.js";

const socketIdToRoomId = [];
const USER_LOST_CONNECTION = "transport close";

const deleteCollabModel = async (roomId) => {
  try {
    await deleteOneCollab(roomId);
  } catch (err) {
    console.log(err);
  }
};

const getCollabModel = async (roomId) => {
  try {
    return await getOneCollab(roomId);
  } catch (err) {
    console.log(err);
  }
};

export const initSocketEventHandlers = (socket, io) => {
  socket.on("join_room", async (data) => {
    await socket.join(data);
    socketIdToRoomId[socket.id] = data;
  });

  socket.on("send-changes", (data) => {
    socket.broadcast.to(data.roomId).emit("receive-changes", data.delta);
  });

  socket.on("cursor-change", (data) => {
    const { roomId, cursor, range } = data;
    socket.broadcast.to(roomId).emit("receive-cursor-change", {
      cursor,
      range,
    });
  });

  socket.on("connect_error", function (err) {
    console.log("client connect_error: ", err);
  });

  socket.on("connect_timeout", function (err) {
    console.log("client connect_timeout: ", err);
  });

  socket.on("disconnect", async (reason) => {
    console.log(`User disconnected, id is: ${socket.id} because ${reason}`);
    const roomId = socketIdToRoomId[socket.id];
    socket.emit("leave_room", roomId);
    socketIdToRoomId.filter((e) => e.Key != socket.id);
    if (reason == USER_LOST_CONNECTION) {
      // either user manually change url or cross browser tab
      console.log(`User with socket id: ${socket.id} has lost connection`);
      // [Case 2.1] this event is only handled if the first user (and not the second user) disconnects
      io.emit("try_update_collab_db");
      // [Case 2.2, 3.2] handle deleting the collab model if second user disconnects
      const collabModel = await getCollabModel(roomId);
      if (!collabModel.user1 || !collabModel.user2) deleteCollabModel(roomId);
    }
  });
};

/*
save code to db upon
1. first user disconnect (if second user disconnects, no client to handle try_update_collab_db)
2. any user leave room

Case 1: first user disconnect, second user leaves room
=> 1. all code in the editor is saved
=> 2. collab model successfully deleted

Case 2: first user disconnect, second user disconnect
=> 1. code until the first user disconnects is saved
=> 2. collab model successfully deleted

Case 3: first user leaves room, second user disconnect
=> 1. code until the first user leaves room is saved
=> 2. collab model successfully deleted 

Case 4: first user leaves room, second user leaves room
=> 1. all code in the editor is saved 
=> 2. collab model successfully deleted
*/
