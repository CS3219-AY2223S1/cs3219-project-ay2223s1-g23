import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, Paper, Box, Grid, Button, TextField, Typography } from "@mui/material";
import CallIcon from "@mui/icons-material/Call";

function RoomPage({ socket }) {
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
            <Grid container>
              <Grid item xs={10}>
                <Typography variant={"h4"}>Topic</Typography>
              </Grid>
              <Grid item xs={2} display="flex" justifyContent="flex-end">
                <Paper varient={6}>
                  <Typography variant={"h5"} m={"5px"}>
                    {difficultyLevel}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
          <Paper variant="outlined" square>
            <Typography sx={{ height: "40rem" }}>Question</Typography>
          </Paper>
        </Box>
      </Grid>
      <Grid item xs={6}>
        <Box display={"flex"} flexDirection={"column"}>
          <TextField multiline rows={27} />
          <Box display={"flex"} flexDirection={"row"}>
            <Grid container>
              <Grid item xs={1}>
                <IconButton>
                  <CallIcon />
                </IconButton>
              </Grid>
              <Grid item xs={11} display={"flex"} justifyContent="flex-end">
                <Button
                  variant="contained"
                  onClick={leaveRoomHandler}
                  color="secondary"
                  sx={{ margin: 1 }}>
                  Submit
                </Button>
                <Button
                  variant="outlined"
                  onClick={leaveRoomHandler}
                  color="error"
                  sx={{ margin: 1 }}>
                  Leave room
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

export default RoomPage;
