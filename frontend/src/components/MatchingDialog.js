import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import { MatchStatus } from "./DifficultySelection";

function MatchingDialog({ initSeconds, isOpen, handleClose, matchStatus, failedFindingMatch }) {
  const [seconds, setSeconds] = useState(initSeconds);
  let title = "";
  let description = "";

  useEffect(() => {
    if (matchStatus === MatchStatus.MATCHING) {
      let myInterval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        }
        if (seconds === 0) {
          clearInterval(myInterval);
          failedFindingMatch();
        }
      }, 1000);
      return () => {
        clearInterval(myInterval);
      };
    }
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setSeconds(30);
  }, [isOpen]);

  switch (matchStatus) {
    case MatchStatus.MATCHING:
      title = "Finding a match...";
      description = "Please wait.";
      break;
    case MatchStatus.NOT_MATCHING:
      title = "Matching cancelled.";
      description = "";
      break;
    case MatchStatus.MATCH_SUCCESS:
      title = "Found a match!";
      description = "";
      break;
    case MatchStatus.MATH_FAILED:
      title = "Failed to find a match.";
      description = "Please try again later.";
      break;
    default:
      console.log("Invalid matchStatus supplied to MatchingDialog");
  }

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          {title}
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          {description} Timer: {seconds} seconds
        </Typography>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
      </Box>
    </Modal>
  );
}

export default MatchingDialog;
