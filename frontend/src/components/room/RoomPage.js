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
import Quill from "quill";
import QuillCursors from "quill-cursors";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { URL_COLLAB, URL_QUES, URL_HIST, URL_COLLAB_SVC, URL_COMM_SVC } from "../../configs";
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_OK } from "../../constants";
import "quill/dist/quill.snow.css";
import axios from "axios";

import io from "socket.io-client";
import decodedJwt from "../../util/decodeJwt";
import QuestionView from "./QuestionView";
import "./Quill.css";

const TOOLBAR_OPTIONS = [
  [{ font: [] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  ["blockquote", "code-block"],
  [{ indent: "-1" }, { indent: "+1" }, { align: [] }],
  ["clean"],
];

const CURSOR_1 = "cursor1";
const CURSOR_2 = "cursor2";

function RoomPage() {
  const { roomId, quesId, histId } = useLocation().state;
  const navigate = useNavigate();
  const decodedToken = decodedJwt();
  const userId = decodedToken.username;
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState();
  const [cursors, setCursors] = useState(null);
  const [voiceSocket, setVoiceSocket] = useState(null);
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

    fetchRoomDetails();
    socketObj.emit("join_room", roomId);

    setUpVoiceChat(200, voiceSocketObj);
  }, []);

  useEffect(() => {
    if (quill == null) return;
    quill.enable();
  });

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };
    socket.on("receive-changes", handler);

    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta, oldDelta, source) => {
      updateAnswer();
      if (source !== "user") return;
      socket.emit("send-changes", { roomId: roomId, delta: delta });
    };
    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (!socket || !ids.user1.userId || !ids.user2.userId) return;

    const handler = ({ cursor, range }) => {
      const isCurrUser = isCursorTheCurrentUser(cursor);
      if (isCurrUser) return;
      cursors.moveCursor(cursor, range);
    };
    socket.on("receive-cursor-change", handler);

    return () => {
      socket.off("receive-cursor-change", handler);
    };
  }, [socket, ids]);

  useEffect(() => {
    if (socket == null || quill == null || !ids.user1.userId || !ids.user2.userId) return;

    const handler = (range, oldRange, source) => {
      // if (source !== "user") return; // source is "user" if user manually move cursor, "api" if cursor move due to other reasons eg text change
      if (range == oldRange) return;
      const currentCursor = getThisCursor();
      cursors.moveCursor(currentCursor, range);
      socket.emit("cursor-change", { roomId: roomId, cursor: currentCursor, range: range }); // a little misleading because even if this user doesn't
      // change cursor, will still fire because the other user's cursor change and sending a cursor-change event with this user's cursor
    };
    quill.on("selection-change", handler);

    return () => {
      quill.off("selection-change", handler);
    };
  }, [socket, quill, ids]);

  const getThisCursor = () => {
    return userId == ids.user1.userId ? CURSOR_1 : CURSOR_2;
  };

  const isCursorTheCurrentUser = (cursorId) => {
    return cursorId == CURSOR_1 && userId == ids.user1.userId;
  };

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    Quill.register("modules/cursors", QuillCursors);
    const q = new Quill(editor, {
      modules: {
        toolbar: TOOLBAR_OPTIONS,
        cursors: {
          transformOnTextChange: true,
        },
      },
      theme: "snow",
      placeholder: "Start typing here...",
    });
    q.disable();
    setQuill(q);

    const cursors = q.getModule("cursors");
    setCursors(cursors);
  }, []);

  useEffect(() => {
    if (!ids.user1.userId || !ids.user2.userId || !cursors) return;
    cursors.createCursor(CURSOR_1, ids.user1.userId, "blue");
    cursors.createCursor(CURSOR_2, ids.user2.userId, "red");
  }, [ids, cursors]);

  useEffect(() => {
    fetchQuesDetails();
  }, [quesId]);

  const updateAnswer = () => {
    const ans = quill.getText();
    setValue(ans);
  };

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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(function (track) {
        track.stop();
      });
    } catch (err) {
      console.log("Something went wrong with stopping audio track: " + err);
    }
    updateCollabInDb();
    navigate(`/`);
  };

  const handleReset = () => {
    const delta = quill.setText("");
    socket.emit("send-changes", { roomId: roomId, delta: delta });
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
          <div className="container" ref={wrapperRef}></div>
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
