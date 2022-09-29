import { Grid, Box, Typography, Button } from "@mui/material";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { URL_INSERT_DIFFICULTY } from "../configs";
import { STATUS_CODE_CREATED } from "../constants";
import { useNavigate } from "react-router-dom";
import MatchingDialog from "./matching/MatchingDialog";
import { useSelector } from "react-redux";

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

function HomePage({ socket }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const username = useSelector((state) => state.user.username);
  // eslint-disable-next-line no-unused-vars
  const [userId, setUserId] = useState(username);
  const [matchStatus, setMatchStatus] = useState(MatchStatus.NOT_MATCHING);
  const [isMatchingDialogOpen, setIsMatchingDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("match_success", (data) => {
      successFindingMatch();
      const roomId = data.roomId;
      navigate(`/room/${roomId}`);
      socket.emit("join_room", roomId);
      socket.emit("prep_room", data);
    });
    return () => socket.off("match_success");
  }, [socket]);

  const startFindingMatch = () => {
    setMatchStatus(MatchStatus.MATCHING);
    setIsMatchingDialogOpen(true);
    socket.emit("find_match", {
      userId: userId,
      difficulty: selectedDifficulty,
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

  const handleDifficulty = (selectedDifficulty) => async (event) => {
    event.preventDefault();
    setSelectedDifficulty(selectedDifficulty);
    if (!selectedDifficulty) {
      console.log("You must select a difficulty level before matching");
      return;
    }
    console.log("Your userId: ", userId);
    console.log("You have selected: ", selectedDifficulty);

    // Post difficult level chosen.
    const res = await axios
      .post(URL_INSERT_DIFFICULTY, {
        userId: userId,
        difficulty: selectedDifficulty,
      })
      .catch((err) => {
        console.log(`error in post: ${err}`);
      });
    if (res && res.status === STATUS_CODE_CREATED) {
      console.log("Difficulty successfully inserted");
    }

    // Start finding match for the user.
    startFindingMatch();
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
