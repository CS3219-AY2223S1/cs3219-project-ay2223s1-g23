import React, { useState, useEffect } from "react";
import axios from "axios";
import { URL_INSERT_DIFFICULTY } from "../configs";
import { STATUS_CODE_CREATED } from "../constants";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";

const MatchStatus = {
  NOT_MATCHING: "NOT_MATCHING",
  MATCHING: "MATCHING",
  MATCH_SUCCESS: "MATCH_SUCCESS",
  MATH_FAILED: "MATCH_FAILED",
};

function DifficultySelection({ socket }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [userId, setUserId] = useState(uuidv4()); // random uuid
  const [matchStatus, setMatchStatus] = useState(MatchStatus.NOT_MATCHING);
  const navigate = useNavigate();

  // useEffect(() => {
  //   console.log("inside useEffect");
  //   socket.on("finding_match", (data) => {
  //     console.log(
  //       `User ID ${data.userId} with difficulty ${data.difficulty} is trying to find a match. Socket ID ${data.socketId}`,
  //     );
  //     // if find match
  //     // then create room id, socket.join(roomId), socket.emit(match success)
  //     console.log(`selectedDiff ${selectedDifficulty}`);
  //     console.log(`data.diff ${data.difficulty}`);
  //     if (selectedDifficulty === data.difficulty) {
  //       console.log("difficulty match found!");
  //       socket.emit("match_found", {
  //         userId: userId,
  //         otherUserId: data.userId,
  //         socketUserId: socket.id,
  //         otherSocketUserId: data.socketId,
  //       });
  //     }
  //     setMatchStatus(MatchStatus.MATCH_SUCCESS);
  //   });
  // }, [socket, selectedDifficulty]);

  useEffect(() => {
    console.log("listening in useeffect");
    socket.on("match_success", (roomId) => {
      console.log("match success on client");
      socket.emit("join_room", roomId);
      navigate(`/room/${roomId}`);
    });
    // socket.on("match_success", (data) => {
    //   if (data.userId != userId && data.otherUserId != userId) {
    //     return;
    //   }
    //   console.log("match success on client");
    //   const roomId = `${data.userId}_${data.otherUserId}`;
    //   // update db
    //   navigate(`/room/${roomId}`);
    //   socket.emit("join_room", {
    //     roomId: roomId,
    //     socketUserId: data.socketUserId,
    //     otherSocketUserId: data.otherSocketUserId,
    //   });
    // });
  }, [socket, navigate]);

  const handleOptionChange = (event) => {
    setSelectedDifficulty(event.target.value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!selectedDifficulty) {
      console.log("You must select a difficulty level before matching");
      return;
    }
    console.log("Your userId: ", userId);
    console.log("You have selected: ", selectedDifficulty);

    // Post difficult level chosen
    const res = await axios
      .post(URL_INSERT_DIFFICULTY, {
        userId: userId,
        difficulty: selectedDifficulty,
      })
      .catch(() => {
        console.log("Please try again later");
      });
    if (res && res.status === STATUS_CODE_CREATED) {
      console.log("Difficulty successfully inserted");
    }
    console.log(`selectedDiff 2 ${selectedDifficulty}`);

    setMatchStatus(MatchStatus.MATCHING);

    // Start matching using socket
    socket.emit("find_match", {
      userId: userId,
      difficulty: selectedDifficulty,
    });
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-12">
          <form onSubmit={handleFormSubmit}>
            <div className="radio">
              <label>
                <input
                  type="radio"
                  value="easy"
                  checked={selectedDifficulty === "easy"}
                  onChange={handleOptionChange}
                />
                Easy
              </label>
            </div>
            <div className="radio">
              <label>
                <input
                  type="radio"
                  value="medium"
                  checked={selectedDifficulty === "medium"}
                  onChange={handleOptionChange}
                />
                Medium
              </label>
            </div>
            <div className="radio">
              <label>
                <input
                  type="radio"
                  value="hard"
                  checked={selectedDifficulty === "hard"}
                  onChange={handleOptionChange}
                />
                Hard
              </label>
            </div>
            <button className="btn btn-default" type="submit">
              Match
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DifficultySelection;
