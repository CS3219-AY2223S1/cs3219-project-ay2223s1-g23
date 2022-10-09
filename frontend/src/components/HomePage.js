import { Grid, Box, Typography, Button } from "@mui/material";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { URL_INSERT_DIFFICULTY, URL_COLLAB } from "../configs";
import { STATUS_CODE_CREATED, STATUS_CODE_NOT_FOUND } from "../constants";
import { useNavigate } from "react-router-dom";
import MatchingDialog from "./room/MatchingDialog";
import { useSelector } from "react-redux";
import { STATUS_CODE_BAD_REQUEST } from "../constants";
import { URL_MATCH_SVC } from "../configs";
import io from "socket.io-client";

export const MatchStatus = {
  NOT_MATCHING: "NOT_MATCHING",
  MATCHING: "MATCHING",
  MATCH_SUCCESS: "MATCH_SUCCESS",
  MATH_FAILED: "MATCH_FAILED",
};

const difficultyStyle = {
  padding: "1rem 8rem 1rem 8rem",
  margin: "1rem",
};

function HomePage() {
  const [socket, setSocket] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const username = useSelector((state) => state.user.username);
  const [userId, setUserId] = useState(username);
  const [matchStatus, setMatchStatus] = useState(MatchStatus.NOT_MATCHING);
  const [isMatchingDialogOpen, setIsMatchingDialogOpen] = useState(false);
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

  const handleCollabRoom = async (data) => {
    const collabExist = await doesCollabExist(data.roomId);
    if (!collabExist) await createCollaboration(data);
    const roomId = data.roomId;
    navigate(`/room/${roomId}`, { state: roomId });
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
      <Grid item xs={1} />
      <Grid item xs={10}>
        <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
          <Typography variant={"h3"} ma={"2rem"}>
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
      <Grid item xs={1} />
    </Grid>
  );
}

export default HomePage;
