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
import ReactQuill from "react-quill";
import Quill from "quill";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { URL_COLLAB, URL_QUES, URL_HIST, URL_COLLAB_SVC, URL_COMM_SVC } from "../../configs";
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_OK } from "../../constants";
import "react-quill/dist/quill.snow.css";
import axios from "axios";

import io from "socket.io-client";
import decodedJwt from "../../util/decodeJwt";
import QuestionView from "./QuestionView";

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

function RoomPage() {
  const { roomId, quesId, histId } = useLocation().state;
  const navigate = useNavigate();
  const decodedToken = decodedJwt();
  const userId = decodedToken.username;
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState();
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
  const [delta, setDelta] = useState("");
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

  // useEffect(() => {
  //   if (!socket) return;
  //   const receiveChangesEventHandler = ({ roomId, text, delta }) => {
  //     setValue(text);
  //     setDelta(delta);
  //   };
  //   socket.on("receive-changes", receiveChangesEventHandler);
  //   return () => socket.off("receive-changes", receiveChangesEventHandler);
  // }, [socket]);

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

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: modules },
    });
    q.disable();
    q.setText("Loading...");
    setQuill(q);
  }, []);

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
    // socket.emit("send-changes", {
    //   roomId: roomId,
    //   delta: {
    //     ops: [{ insert: "\n" }],
    //   },
    // });
  };

  // const quillEditorOnChangeHandler = (content, delta, source, editor) => {
  //   if (source !== "user") return; // tracking only user changes
  //   const text = editor.getText();
  //   const fullDelta = editor.getContents();
  //   socket.emit("send-changes", { roomId: roomId, text: text, delta: fullDelta });
  // };

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
          {/* <ReactQuill
            preserveWhitespace
            value={delta}
            modules={modules}
            theme="snow"
            onChange={quillEditorOnChangeHandler}
            placeholder="Content goes here..."
          /> */}
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
