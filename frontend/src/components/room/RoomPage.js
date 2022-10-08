import {
  IconButton,
  Paper,
  Box,
  Grid,
  Button,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CallIcon from "@mui/icons-material/Call";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { URL_COLLAB } from "../../configs";
import { STATUS_CODE_BAD_REQUEST } from "../../constants";

const modules = {
  toolbar: [
    [{ font: [] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }, { align: [] }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

function RoomPage({ socket }) {
  const { state } = useLocation();
  const [ids, setIds] = useState({
    user1: {
      userId: "",
    },
    user2: {
      userId: "",
    },
  });
  const [roomId, setRoomId] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoomDetails();
  }, []);

  useEffect(() => {
    const receiveChangesEventHandler = ({ roomId, text }) => {
      setValue(text);
    };
    socket.on("receive-changes", receiveChangesEventHandler);
    return () => socket.off("receive-changes", receiveChangesEventHandler);
  }, [socket]);

  const fetchRoomDetails = async () => {
    const res = await axios.get(`${URL_COLLAB}/${state}`).catch((err) => {
      if (err.response.status === STATUS_CODE_BAD_REQUEST) {
        console.log("ERROR: " + err.response.data.message);
      } else {
        console.log("Please try again later");
      }
    });
    if (res.status != 200) return;
    const { user1, user2, roomId, difficulty } = res.data.data;
    setIds({
      user1: {
        userId: user1,
      },
      user2: {
        // user from the queue
        userId: user2,
      },
    });
    setRoomId(roomId);
    setDifficultyLevel(difficulty);
  };

  const deleteCollab = async () => {
    await axios.delete(`${URL_COLLAB}/${roomId}`).catch((err) => {
      if (err.response.status === STATUS_CODE_BAD_REQUEST) {
        console.log("ERROR: " + err.response.data.message);
      } else {
        console.log("Please try again later");
      }
    });
  };

  const updateCollab = async () => {
    const res = await axios.put(`${URL_COLLAB}`, { roomId: roomId, text: value }).catch((err) => {
      if (err.response.status === STATUS_CODE_BAD_REQUEST) {
        console.log("ERROR: " + err.response.data.message);
      } else {
        console.log("Please try again later");
      }
    });
  };

  const handleLeaveRoom = () => {
    socket.emit("leave_room", ids.user2.userId);
    updateCollab();
    // TODO: add data to history-service
    deleteCollab();
    navigate(`/diff`);
  };

  const handleReset = () => {
    socket.emit("send-changes", { roomId: roomId, text: "" });
  };

  const quillEditorOnChangeHandler = (content, delta, source, editor) => {
    if (source !== "user") return; // tracking only user changes
    const text = editor.getText();
    socket.emit("send-changes", { roomId: roomId, text: text });
  };

  return (
    <Grid container>
      <Grid item xs={6}>
        <Box mr={"1rem"}>
          <Typography variant={"h4"}>
            {ids.user1.userId} and {ids.user2.userId}&apos;s room
          </Typography>
          <Divider variant="middle" />
          <Box display={"flex"} flexDirection={"row"} mt={"1rem"} mb={"1rem"}>
            <Grid container>
              <Grid item xs={10}>
                <Typography variant={"h5"}>question.title</Typography>
              </Grid>
              <Grid item xs={2} display="flex" justifyContent="flex-end">
                <Paper varient={6}>
                  <Typography variant={"h5"} m={"5px"}>
                    {difficultyLevel ?? "unknown diff"}
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
          <Grid container>
            <Grid item xs={1} />
            <Grid item xs={11} display={"flex"} justifyContent="flex-end">
              <Button variant="contained" color="secondary" sx={{ margin: 1 }}>
                Change Question
              </Button>
              <Button variant="contained" onClick={handleReset} color="error" sx={{ margin: 1 }}>
                Reset
              </Button>
            </Grid>
          </Grid>
          <ReactQuill
            preserveWhitespace
            value={value}
            modules={modules}
            theme="snow"
            onChange={quillEditorOnChangeHandler}
            placeholder="Content goes here..."
          />
          <Box display={"flex"} flexDirection={"row"}>
            <Grid container>
              <Grid item xs={1}>
                <IconButton>
                  <CallIcon />
                </IconButton>
              </Grid>
              <Grid item xs={11} display={"flex"} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={handleLeaveRoom}
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
