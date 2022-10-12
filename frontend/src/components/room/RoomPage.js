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
import PhoneDisabledIcon from "@mui/icons-material/PhoneDisabled";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { URL_COLLAB, URL_QUES } from "../../configs";
import { STATUS_CODE_BAD_REQUEST } from "../../constants";
import { URL_COLLAB_SVC } from "../../configs";
import io from "socket.io-client";
import decodedJwt from "../../util/decodeJwt";

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

function RoomPage({ voiceSocket }) {
  const { roomId, quesId } = useLocation().state;
  const navigate = useNavigate();
  const decodedToken = decodedJwt();
  const userId = decodedToken.username;
  const [socket, setSocket] = useState(null);
  const [ids, setIds] = useState({
    user1: {
      userId: "",
    },
    user2: {
      userId: "",
    },
  });
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [value, setValue] = useState("");
  const [question, setQuestion] = useState({
    id: "id",
    title: "title",
    body: "body",
    difficulty: "difficulty",
    url: "url",
  });

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
          console.log("sending sound " + userId);
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
      console.log("playing sound " + userId);
    });
  };

  useEffect(() => {
    const socketObj = io.connect(URL_COLLAB_SVC, { path: `/room` });
    setSocket(socketObj);

    fetchRoomDetails();
    socketObj.emit("join_room", roomId);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const receiveChangesEventHandler = ({ roomId, text }) => {
      setValue(text);
    };
    socket.on("receive-changes", receiveChangesEventHandler);
    return () => socket.off("receive-changes", receiveChangesEventHandler);
  }, [socket]);

  useEffect(() => {
    setUpVoiceChat(1000);
  }, []);

  useEffect(() => {
    fetchQuesDetails();
  }, [quesId]);

  const fetchQuesDetails = async () => {
    const res = await axios
      .get(`${URL_QUES}/id`, {
        params: {
          id: quesId,
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

  function joinCall(e) {
    console.log("Setting online status to true");
    voiceSocket.emit("userInfo", { roomId, online: true });
  }

  function leaveCall(e) {
    console.log("Setting online status to false");
    voiceSocket.emit("userInfo", { roomId, online: false });
  }

  useEffect(() => {
    if (!socket) return;
    // this event is only handled if the first user and not the second user disconnects
    const tryUpdateCollabDbHandler = async () => {
      console.log("[try_update_collab_db] from the user still in the room (second user)");
      await updateCollab({ roomId: roomId, text: value }); // update text/code from shared editor
      // TODO: add data to history-service
      await updateCollabToRemoveUser(false); // remove userId of the (other) user that left
    };
    socket.on("try_update_collab_db", tryUpdateCollabDbHandler);
    return () => socket.off("try_update_collab_db", tryUpdateCollabDbHandler);
  }, [socket, value, ids]);

  const updateCollabInDb = async () => {
    await updateCollab({ roomId: roomId, text: value }); // update text/code from shared editor
    // TODO: add data to history-service
    const updatedCollab = (await updateCollabToRemoveUser()).data.data; // remove userId of the (current) user that left
    if (!updatedCollab.user1 && !updatedCollab.user2) await deleteCollab(); // if both users have left, delete collab
  };

  const fetchRoomDetails = async () => {
    const res = await axios.get(`${URL_COLLAB}/${roomId}`).catch((err) => {
      if (err.response.status === STATUS_CODE_BAD_REQUEST) {
        console.log("ERROR: " + err.response.data.message);
      } else {
        console.log("Please try again later");
      }
    });
    if (res.status != 200) return;
    const { user1, user2, difficulty } = res.data.data;
    setIds({
      user1: {
        userId: user1,
      },
      user2: {
        // user from the queue
        userId: user2,
      },
    });
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

  const updateCollab = async (data) => {
    const res = await axios.put(`${URL_COLLAB}`, { ...data, roomId: roomId }).catch((err) => {
      if (err.response.status === STATUS_CODE_BAD_REQUEST) {
        console.log("ERROR: " + err.response.data.message);
      } else {
        console.log("Please try again later");
      }
    });
    return res;
  };

  const updateCollabToRemoveUser = async (removeCurrentUser = true) => {
    let isCurrentUser1;
    if (userId == ids.user1.userId) {
      isCurrentUser1 = true;
    } else if (userId == ids.user2.userId) {
      isCurrentUser1 = false;
    } else {
      console.log("something went wrong in updateCollabToRemoveUser");
      return;
    }
    const updatedUserId =
      (isCurrentUser1 && removeCurrentUser) || (!isCurrentUser1 && !removeCurrentUser)
        ? {
            user1: null,
          }
        : {
            user2: null,
          };
    const res = await updateCollab({ ...updatedUserId });
    return res;
  };

  const handleLeaveRoom = async () => {
    await socket.disconnect();
    updateCollabInDb();
    navigate(`/diff`);
  };

  const handleReset = () => {
    socket.emit("send-changes", { text: "" });
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
                <Typography variant={"h5"}>{question.title}</Typography>
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
