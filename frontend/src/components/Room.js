import { useState, useEffect } from "react";

function Room({ socket }) {
  const [ids, setIds] = useState({
    user1: {
      userId: "",
      socketId: "",
    },
    user2: {
      userId: "",
      socketId: "",
    },
  });
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    console.log("listening in useeffect");
    socket.on("welcome_room", (data) => {
      console.log("welcome on client");
      const { userId1, userId2, socketId1, socketId2, roomId } = data;
      setIds({
        user1: {
          userId: userId1,
          socketId: socketId1,
        },
        user2: {
          userId: userId2,
          socketId: socketId2,
        },
      });
      setRoomId(roomId);
    });
  }, [socket]);

  return (
    <div className="container">
      Welcome {ids.user1.userId} and {ids.user2.userId} to room ${roomId}!
    </div>
  );
}

export default Room;
