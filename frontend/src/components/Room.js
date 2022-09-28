import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

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
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const welcomeRoomEventHandler = (data) => {
      const { userId1, userId2, socketId1, socketId2, roomId, difficulty } = data;
      console.log(
        "[welcome_room socket event emitted] userIds are " + userId1 + ", and " + userId2,
      );
      setIds({
        user1: {
          userId: userId1,
          socketId: socketId1,
        },
        user2: {
          // user from the queue
          userId: userId2,
          socketId: socketId2,
        },
      });
      setRoomId(roomId);
      setDifficultyLevel(difficulty);
    };
    socket.on("welcome_room", welcomeRoomEventHandler);
    return () => socket.off("welcome_room", welcomeRoomEventHandler);
  }, [socket]);

  const leaveRoomHandler = () => {
    socket.emit("leave_room", ids.user2.userId);
    navigate(`/diff`);
  };

  return (
    <div className="container">
      <div>
        {" "}
        Welcome {ids.user1.userId} and {ids.user2.userId} to room {roomId}! Your choice of
        difficulty is {difficultyLevel}
      </div>
      <Button variant="outlined" onClick={leaveRoomHandler}>
        Leave room
      </Button>
    </div>
  );
}

export default Room;
