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
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
import { QuillBinding } from "y-quill";

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

function RoomPage() {
  const { roomId, quesId, histId } = useLocation().state;
  const navigate = useNavigate();
  const decodedToken = decodedJwt();
  const userId = decodedToken.username;
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
  const [question, setQuestion] = useState({
    id: "id",
    title: "title",
    body: "body",
    difficulty: "difficulty",
    url: "url",
  });

  // A Yjs document holds the shared data
  const ydoc = new Y.Doc();
  // Define a shared text type on the document
  const ytext = ydoc.getText("quill");
  const provider = new SocketIOProvider(URL_COLLAB_SVC, roomId, ydoc, {
    autoConnect: true,
  });
  let binding;

  const awareness = provider.awareness;

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
    const voiceSocketObj = io.connect(URL_COMM_SVC);
    setVoiceSocket(voiceSocketObj);

    fetchRoomDetails();

    setUpVoiceChat(200, voiceSocketObj);
  }, []);

  useEffect(() => {
    if (quill == null) return;
    quill.enable();
  });

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    Quill.register("modules/cursors", QuillCursors);
    const q = new Quill(editor, {
      modules: {
        toolbar: TOOLBAR_OPTIONS,
        cursors: true,
      },
      theme: "snow",
      placeholder: "Start typing here...",
    });
    q.disable();
    setQuill(q);

    // Create an editor-binding which "binds" the quill editor to a Y.Text type.
    binding = new QuillBinding(ytext, q, awareness);
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

  const updateCollabInDb = async () => {
    await updateCollab({ roomId: roomId, text: ytext.toString() }); // update text/code from shared editor
    const updatedCollab = (await updateCollabToRemoveUser()).data.data; // remove userId of the (current) user that left
    if (!updatedCollab.user1 && !updatedCollab.user2) await cleanUpCollab(); // if both users have left properly, delete collab
  };

  const cleanUpCollab = async () => {
    await deleteCollab();
    binding.destroy();
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

    awareness.setLocalStateField("user", {
      name: userId,
      color: userId == user1 ? "#30bced" : "#9ac2c9", // should be a hex color
    });
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
    await provider.disconnect();
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
    ydoc.transact(() => {
      // perform all changes in a single transaction
      ytext.delete(0, ytext.length);
    });
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
