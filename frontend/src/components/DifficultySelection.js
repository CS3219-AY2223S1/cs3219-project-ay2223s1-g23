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

  useEffect(() => {
    console.log("listening in useeffect");
    socket.on("match_success", (data) => {
      const roomId = data.roomId;
      socket.emit("join_room", roomId);
      socket.emit("prep_room", data);
      navigate(`/room/${roomId}`);
    });
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

    // Post difficult level chosen.
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

    setMatchStatus(MatchStatus.MATCHING);

    // Start finding match for the user.
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
