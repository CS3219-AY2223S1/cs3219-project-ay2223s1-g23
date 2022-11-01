import { Grid, Box, Typography, Button, List, ListItem, Paper, Divider } from "@mui/material";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { URL_INSERT_DIFFICULTY, URL_COLLAB, URL_HIST_SVC } from "../configs";
import { STATUS_CODE_CREATED, STATUS_CODE_NOT_FOUND, STATUS_CODE_OK } from "../constants";
import { useNavigate } from "react-router-dom";
import MatchingDialog from "./room/MatchingDialog";
import HistoryCard from "./HistoryCard";
import { STATUS_CODE_BAD_REQUEST } from "../constants";
import { URL_MATCH_SVC } from "../configs";
import io from "socket.io-client";
import decodedJwt from "../util/decodeJwt";

export const MatchStatus = {
  NOT_MATCHING: "NOT_MATCHING",
  MATCHING: "MATCHING",
  MATCH_SUCCESS: "MATCH_SUCCESS",
  MATH_FAILED: "MATCH_FAILED",
};

const difficultyStyle = {
  margin: "1rem",
  height: 65,
  width: 200,
  border: 3,
  borderColor: "secondary.main",
  fontWeight: "bold",
};

function HomePage() {
  const [socket, setSocket] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const decodedToken = decodedJwt();
  const username = decodedToken.username;
  const [userId, setUserId] = useState(username);
  const [matchStatus, setMatchStatus] = useState(MatchStatus.NOT_MATCHING);
  const [isMatchingDialogOpen, setIsMatchingDialogOpen] = useState(false);
  const [histories, setHistories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io.connect(URL_MATCH_SVC, { path: "/diff" });
    setSocket(socket);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const matchSuccessEventHandler = (data) => {
      successFindingMatch();
      socket.emit("clean_up", userId);
      handleCollabRoom(data);
    };
    socket.on("match_success", matchSuccessEventHandler);
    return () => socket.off("match_success", matchSuccessEventHandler);
  }, [socket]);

  useEffect(() => {
    getHistory(userId);
  }, []);

  const getHistory = async (userId) => {
    const res = await axios
      .get(`${URL_HIST_SVC}/userId`, {
        params: {
          userId: userId,
        },
      })
      .catch((err) => {
        if (err.status === STATUS_CODE_BAD_REQUEST) {
          console.log("ERROR: " + err.response.data.message);
        } else {
          console.log("Please try again later");
        }
      });
    if (!res || res.status != STATUS_CODE_OK) return;
    setHistories(res.data.data);
  };

  const handleCollabRoom = async (data) => {
    const collabExist = await doesCollabExist(data.roomId);
    if (!collabExist) await createCollaboration(data);
    const roomId = data.roomId;
    navigate(`/room/${roomId}`, {
      state: {
        roomId: roomId,
        quesId: data.quesId,
      },
    });
  };

  const createCollaboration = async (data) => {
    const { userId1, userId2, socketId1, socketId2, roomId, difficulty } = data;
    await axios
      .post(URL_COLLAB, { user1: userId1, user2: userId2, roomId, difficulty })
      .catch((err) => {
        if (err.response.status === STATUS_CODE_BAD_REQUEST) {
          console.log("ERROR: " + err.response.data.message);
        } else {
          console.log("Please try again later");
        }
      });
  };

  const doesCollabExist = async (data) => {
    let exists = true;
    exists = await axios.get(`${URL_COLLAB}/${data}`).catch((err) => {
      if (err.response.status === STATUS_CODE_NOT_FOUND) {
        return false;
      }
    });
    return exists;
  };

  const startFindingMatch = (diff) => {
    setMatchStatus(MatchStatus.MATCHING);
    setIsMatchingDialogOpen(true);
    socket.emit("find_match", {
      userId: userId,
      difficulty: diff,
    });
  };

  const failedFindingMatch = () => {
    setMatchStatus(MatchStatus.MATH_FAILED);
    socket.emit("stop_find_match", {
      userId: userId,
      difficulty: selectedDifficulty,
    });
  };

  const stopFindingMatch = () => {
    setIsMatchingDialogOpen(false);
    if (matchStatus !== MatchStatus.MATH_FAILED) {
      setMatchStatus(MatchStatus.NOT_MATCHING);
      socket.emit("stop_find_match", {
        userId: userId,
        difficulty: selectedDifficulty,
      });
    }
  };

  const successFindingMatch = () => {
    setMatchStatus(MatchStatus.MATCH_SUCCESS);
    setIsMatchingDialogOpen(false);
  };

  const handleDifficulty = (diff) => async (event) => {
    event.preventDefault();
    setSelectedDifficulty(diff);
    if (!diff) {
      console.log("You must select a difficulty level before matching");
      return;
    }
    console.log("Your userId: ", userId);
    console.log("You have selected: ", diff);

    // Post difficult level chosen.
    const res = await axios
      .post(URL_INSERT_DIFFICULTY, {
        userId: userId,
        difficulty: diff,
      })
      .catch((err) => {
        console.log(`error in post: ${err}`);
      });
    if (res && res.status === STATUS_CODE_CREATED) {
      console.log("Difficulty successfully inserted");
    }

    // Start finding match for the user.
    // Need to pass in diff because selectedDifficulty state may not have been updated.
    startFindingMatch(diff);
  };

  return (
    <Grid container>
      <Grid item xs>
        <Box display={"flex"} alignItems={"left"} justifyContent={"left"}>
          <Typography variant={"h4"} mb={"1rem"}>
            History
          </Typography>
        </Box>
        <Paper elevation={0} sx={{ height: "45rem", overflow: "auto", marginRight: 3 }}>
          <List sx={{ width: "100%", bgcolor: "background.paper" }}>
            {histories.map((history, index) => {
              return (
                <Box key={history._id}>
                  <ListItem display="block" sx={{ width: "100%" }}>
                    <HistoryCard histId={history._id} questionId={history.quesId} />
                  </ListItem>
                  <Divider variant="middle" />
                </Box>
              );
            })}
          </List>
        </Paper>
        Scroll for more history record....
      </Grid>
      <Divider flexItem orientation="vertical" sx={{ borderRightWidth: 6 }} />
      <Grid item xs>
        <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
          <Typography variant={"h4"} ma={"2rem"}>
            Random Matching
          </Typography>
        </Box>
        <Box
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          justifyContent={"center"}>
          <Button
            variant="contained"
            onClick={handleDifficulty("easy")}
            color={"secondary"}
            sx={difficultyStyle}>
            Easy
          </Button>
          <Button
            variant="outlined"
            onClick={handleDifficulty("medium")}
            color={"secondary"}
            sx={difficultyStyle}>
            Medium
          </Button>
          <Button
            variant="contained"
            onClick={handleDifficulty("hard")}
            color={"secondary"}
            sx={difficultyStyle}>
            Hard
          </Button>
          <MatchingDialog
            initSeconds={30}
            isOpen={isMatchingDialogOpen}
            handleClose={stopFindingMatch}
            matchStatus={matchStatus}
            failedFindingMatch={failedFindingMatch}
          />
        </Box>
      </Grid>
    </Grid>
  );
}

export default HomePage;
