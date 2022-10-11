import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IconButton, Paper, Box, Grid, Button, Typography } from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import PhoneDisabledIcon from "@mui/icons-material/PhoneDisabled";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { URL_COLLAB, URL_QUES } from "../../configs";
import { STATUS_CODE_BAD_REQUEST } from "../../constants";
import { useSelector } from "react-redux";

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

function RoomPage({ matchSocket, voiceSocket }) {
  const setUpVoiceChat = async (time) => {
    console.log("Setting up voice recording");
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      var madiaRecorder = new MediaRecorder(stream);
      madiaRecorder.start();

      var audioChunks = [];

      madiaRecorder.addEventListener("dataavailable", function (event) {
        audioChunks.push(event.data);
      });

      madiaRecorder.addEventListener("stop", function () {
        var audioBlob = new Blob(audioChunks);

        audioChunks = [];

        var fileReader = new FileReader();
        fileReader.readAsDataURL(audioBlob);
        fileReader.onloadend = function () {
          console.log("sending sound " + username);
          var base64String = fileReader.result;
          voiceSocket.emit("voice", base64String);
        };

        madiaRecorder.start();

        setTimeout(function () {
          madiaRecorder.stop();
        }, time);
      });

      setTimeout(function () {
        madiaRecorder.stop();
      }, time);
    });

    voiceSocket.on("send", function (data) {
      var audio = new Audio(data);
      audio.play();
      console.log("playing sound " + username);
    });
  };

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
  const [value, setValue] = useState("");
  const [question, setQuestion] = useState({
    id: "id",
    title: "title",
    body: "body",
    difficulty: "difficulty",
    url: "url",
  });
  const navigate = useNavigate();
  const username = useSelector((state) => state.user.username);

  useEffect(() => {
    fetchRoomDetails();
  });

  useEffect(() => {
    setUpVoiceChat(1000);
  }, []);

  useEffect(() => {
    fetchQuesDetails();
  }, [state.quesId]);

  const fetchQuesDetails = async () => {
    const res = await axios
      .get(`${URL_QUES}/id`, {
        params: {
          id: state.quesId,
        },
      })
      .catch((err) => {
        if (err.response.status === STATUS_CODE_BAD_REQUEST) {
          console.log("ERROR: " + err.response.data.message);
        } else {
          console.log("Please try again later");
        }
      });
    if (res.status != 200) return;
    const { _id, title, body, difficulty, url } = res.data.data;
    setQuestion({
      id: _id,
      title: title,
      body: body,
      difficulty: difficulty,
      url: url,
    });
  };

  useEffect(() => {
    const receiveChangesEventHandler = ({ roomId, text }) => {
      setValue(text);
    };
    matchSocket.on("receive-changes", receiveChangesEventHandler);
    return () => matchSocket.off("receive-changes", receiveChangesEventHandler);
  }, [matchSocket]);

  function joinCall(e) {
    console.log("Setting online status to true");
    voiceSocket.emit("userInfo", { roomId, online: true });
  }

  function leaveCall(e) {
    console.log("Setting online status to false");
    voiceSocket.emit("userInfo", { roomId, online: false });
  }

  const fetchRoomDetails = async () => {
    const res = await axios.get(`${URL_COLLAB}/${state.roomId}`).catch((err) => {
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
    matchSocket.emit("leave_room", ids.user2.userId);
    updateCollab();
    // TODO: add data to history-service
    deleteCollab();
    navigate(`/diff`);
  };

  const handleReset = () => {
    matchSocket.emit("send-changes", { roomId: roomId, text: "" });
  };

  const quillEditorOnChangeHandler = (content, delta, source, editor) => {
    if (source !== "user") return; // tracking only user changes
    const text = editor.getText();
    matchSocket.emit("send-changes", { roomId: roomId, text: text });
  };

  return (
    <Grid container>
      <Grid item xs={6}>
        <Box mr={"1rem"}>
          <Box display={"flex"} flexDirection={"row"} mb={"1rem"}>
            <Grid container>
              <Grid item xs={10}>
                <Typography variant={"h4"}>
                  {ids.user1.userId} and {ids.user2.userId}&apos;s room
                </Typography>
              </Grid>
              <Grid item xs={2} display="flex" justifyContent="flex-end">
                <Paper varient={6}>
                  <Typography variant={"h5"} m={"5px"}>
                    {question.difficulty ?? "unknown diff"}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
          <Paper variant="outlined" square>
            <Typography sx={{ height: "30rem" }}>{question.body}</Typography>
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
              <Grid item xs={2}>
                <IconButton onClick={joinCall} color="secondary">
                  <CallIcon />
                </IconButton>
                <IconButton onClick={leaveCall} color="error">
                  <PhoneDisabledIcon />
                </IconButton>
              </Grid>
              <Grid item xs={10} display={"flex"} justifyContent="flex-end">
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
