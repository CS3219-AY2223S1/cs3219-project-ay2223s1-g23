import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, Paper, Box, Grid, Button, TextField, Typography } from "@mui/material";
import { VolumeUp } from "@mui/icons-material";

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
  // eslint-disable-next-line no-unused-vars
  const [roomId, setRoomId] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("welcome_room", (data) => {
      const { userId1, userId2, socketId1, socketId2, roomId, difficulty } = data;
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
    });
    return () => socket.off("welcome_room");
  }, [socket]);

  const leaveRoomHandler = () => {
    socket.emit("leave_room", ids.user2.userId);
    navigate(`/diff`);
  };

  return (
    <Grid container>
      <Grid item xs={6}>
        <Box mr={"1rem"}>
          <Box display={"flex"} flexDirection={"row"} mb={"1rem"}>
            <Typography variant={"h4"}>Topic</Typography>
            <Paper>
              <Typography variant={"h5"} m={"5px"}>
                {difficultyLevel}
              </Typography>
            </Paper>
          </Box>
          <Paper variant="outlined" square>
            <Typography>Question</Typography>
          </Paper>
        </Box>
      </Grid>
      <Grid item xs={6}>
        <Box display={"flex"} flexDirection={"column"}>
          <TextField multiline />
          <Box display={"flex"} flexDirection={"row"}>
            <IconButton>
              <VolumeUp />
            </IconButton>
            <Button variant="outlined" onClick={leaveRoomHandler}>
              Submit
            </Button>
            <Button variant="outlined" onClick={leaveRoomHandler} color="error">
              Leave room
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

export default Room;
