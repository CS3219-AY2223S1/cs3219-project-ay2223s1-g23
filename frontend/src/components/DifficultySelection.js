import React, { useState, useEffect } from "react";
import axios from "axios";
import { URL_INSERT_DIFFICULTY, URL_COLLAB } from "../configs";
import { STATUS_CODE_CREATED } from "../constants";
import { useNavigate } from "react-router-dom";
import MatchingDialog from "./MatchingDialog";
import { useSelector } from "react-redux";
import { STATUS_CODE_BAD_REQUEST } from "../constants";

export const MatchStatus = {
  NOT_MATCHING: "NOT_MATCHING",
  MATCHING: "MATCHING",
  MATCH_SUCCESS: "MATCH_SUCCESS",
  MATH_FAILED: "MATCH_FAILED",
};

function DifficultySelection({ socket }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const username = useSelector((state) => state.user.username);
  const [userId, setUserId] = useState(username);
  const [matchStatus, setMatchStatus] = useState(MatchStatus.NOT_MATCHING);
  const [isMatchingDialogOpen, setIsMatchingDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const matchSuccessEventHandler = (data) => {
      successFindingMatch();
      const roomId = data.roomId;
      socket.emit("join_room", roomId);
      handleCollabRoom(data);
    };
    socket.on("match_success", matchSuccessEventHandler);
    return () => socket.off("match_success", matchSuccessEventHandler);
  }, [socket]);

  const handleCollabRoom = async (data) => {
    await createCollaboration(data);
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

    // Start finding match for the user.
    startFindingMatch();
  };

  return (
    <div className="container">
      <MatchingDialog
        initSeconds={30}
        isOpen={isMatchingDialogOpen}
        handleClose={stopFindingMatch}
        matchStatus={matchStatus}
        failedFindingMatch={failedFindingMatch}
      />
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
