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
import CallIcon from "@mui/icons-material/Call";
import PhoneDisabledIcon from "@mui/icons-material/PhoneDisabled";
import ReactQuill, { Quill } from "react-quill";
import CallIcon from "@mui/icons-material/Call";
import PhoneDisabledIcon from "@mui/icons-material/PhoneDisabled";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { URL_COLLAB, URL_QUES, URL_HIST, URL_COLLAB_SVC, URL_COMM_SVC } from "../../configs";
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_OK } from "../../constants";
import "react-quill/dist/quill.snow.css";
import axios from "axios";

import io from "socket.io-client";
import decodedJwt from "../../util/decodeJwt";
import hljs from "highlight.js";
import "highlight.js/styles/monokai-sublime.css";
import QuillCursors from "quill-cursors";
import QuestionView from "./QuestionView";

Quill.register("modules/cursors", QuillCursors);

const modules = {
  cursors: {
    transformOnTextChange: true,
  },
  syntax: {
    highlight: (text) => hljs.highlightAuto(text).value,
  },
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

const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    const context = this;
    const later = function () {
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

function RoomPage() {
  const { roomId, quesId, histId } = useLocation().state;
  const navigate = useNavigate();
  const decodedToken = decodedJwt();
  const userId = decodedToken.username;
  const [socket, setSocket] = useState(null);
  const [voiceSocket, setVoiceSocket] = useState(null);
  const [ids, setIds] = useState({
    user1: {
      userId: "",
    },
    user2: {
      userId: "",
    },
  });
  const [isUser1, setIsUser1] = useState(null);
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [value, setValue] = useState("");
  const [delta, setDelta] = useState("");
  const [question, setQuestion] = useState({
    id: "id",
    title: "title",
    body: "body",
    difficulty: "difficulty",
    url: "url",
  });
  const quillEditor = useRef(null);
  const [cursor1, setCursor1] = useState(null);

  const setUpVoiceChat = async (time, voiceSocketObj) => {
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
          var base64String = fileReader.result;
          voiceSocketObj.emit("voice", base64String);
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

    voiceSocketObj.on("send", function (data) {
      var audio = new Audio(data);
      audio.play();
    });
  };

  useEffect(() => {
    const socketObj = io.connect(URL_COLLAB_SVC, { path: `/room` });
    setSocket(socketObj);

    const voiceSocketObj = io.connect(URL_COMM_SVC);
    setVoiceSocket(voiceSocketObj);
    setUpVoiceChat(200, voiceSocketObj);

    fetchRoomDetails();
    socketObj.emit("join_room", roomId);

    const myCursor = quillEditor.current.getEditor().getModule("cursors");
    myCursor.createCursor("cursor", "apple", "blue");
    setCursor1(myCursor);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const receiveChangesEventHandler = ({ roomId, text, delta }) => {
      setValue(text);
      setDelta(delta);
    };
    socket.on("receive-changes", receiveChangesEventHandler);
    return () => socket.off("receive-changes", receiveChangesEventHandler);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const receiveCursorUpdateHandler = ({ from, range }) => {
      if (isUser1 && from != ids.user1.userId) {
        cursor1.moveCursor("cursor", range);
      } else {
        cursor2.moveCursor("cursor", range);
      }
    };
    socket.on("receive-cursor-update", receiveCursorUpdateHandler);
    return () => socket.off("receive-cursor-update", receiveCursorUpdateHandler);
  }, [socket]);

  // useEffect(() => {
  //   setUpVoiceChat(1000);
  // }, []);

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
    if (res.status != STATUS_CODE_OK) return;
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
    if (!res || res.status != STATUS_CODE_OK) return;
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
    setIsUser1(user1 == userId);
  };

  // src: https://github.com/reedsy/quill-cursors/blob/main/example/main.js
  const selectionChangeHandler = (cursors) => {
    console.log("in selectionChangeHandler");
    const debouncedUpdate = debounce(updateCursor, 500);

    return function (range, oldRange, source) {
      console.log(range);
      cursors.moveCursor("cursor", range);
      socket.emit("update-cursor", {
        from: userId,
        range: range,
      });
      console.log(source);
      // console.log(source);
      // if (source === "user") {
      //   console.log(range);
      //   console.log(cursors);
      //   updateCursor(range);
      // } else {
      //   debouncedUpdate(range);
      // }
    };

    function updateCursor(range) {
      setTimeout(() => cursors.moveCursor("cursor", range), 1000);
    }
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

    await updateHistory(data.text);

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

  const updateHistory = async (text) => {
    if (!histId) return;
    await axios
      .put(`${URL_HIST}`, {
        id: histId,
        answer: text,
      })
      .catch((err) => {
        if (err.response.status === STATUS_CODE_BAD_REQUEST) {
          console.log("ERROR: " + err.response.data.message);
        } else {
          console.log("Please try again later");
        }
      });
  };

  const handleLeaveRoom = async () => {
    await socket.disconnect();
    await voiceSocket.disconnect();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(function (track) {
      track.stop();
    });
    updateCollabInDb();
    navigate(`/`);
  };

  const handleReset = () => {
    socket.emit("send-changes", { text: "" });
  };

  const quillEditorOnChangeHandler = (content, delta, source, editor) => {
    if (source !== "user") return; // tracking only user changes
    const text = editor.getText();
    const fullDelta = editor.getContents();
    socket.emit("send-changes", { roomId: roomId, text: text, delta: fullDelta });
  };

  return (
    <Grid container>
      <Grid item xs={6}>
        <Box mr={"1rem"}>
          <Typography variant={"h4"}>
            {ids.user1.userId} and {ids.user2.userId}&apos;s room
          </Typography>
          <Divider variant="middle" />
          <QuestionView
            title={question.title}
            questionBody={question.body}
            difficulty={question.difficulty}
          />
        </Box>
      </Grid>
      <Grid item xs={6}>
        <Box display={"flex"} flexDirection={"column"}>
          <Grid container>
            <Grid item xs={1} />
            <Grid item xs={11} display={"flex"} justifyContent="flex-end">
              <Button variant="contained" onClick={handleReset} color="error" sx={{ margin: 1 }}>
                Reset
              </Button>
            </Grid>
          </Grid>
          <ReactQuill
            ref={quillEditor}
            preserveWhitespace
            value={delta}
            modules={modules}
            theme="snow"
            onChange={quillEditorOnChangeHandler}
            onChangeSelection={selectionChangeHandler(cursor1)}
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
