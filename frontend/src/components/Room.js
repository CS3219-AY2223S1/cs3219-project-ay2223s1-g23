import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { URL_COLLAB } from "../configs";
import { STATUS_CODE_BAD_REQUEST } from "../constants";

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

function Room({ socket }) {
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

  const leaveRoomHandler = () => {
    socket.emit("leave_room", ids.user2.userId);
    updateCollab();
    // TODO: add data to history-service
    deleteCollab();
    navigate(`/diff`);
  };

  const quillEditorOnChangeHandler = (content, delta, source, editor) => {
    if (source !== "user") return; // tracking only user changes
    const text = editor.getText();
    socket.emit("send-changes", { roomId: roomId, text: text });
  };

  return (
    <div className="container">
      <div>
        {" "}
        Welcome {ids.user1.userId} and {ids.user2.userId} to room {roomId}! Your choice of
        difficulty is {difficultyLevel}
      </div>
      <Button variant="outlined" onClick={leaveRoomHandler}>
        Leave room
      </Button>
      <ReactQuill
        preserveWhitespace
        value={value}
        modules={modules}
        theme="snow"
        onChange={quillEditorOnChangeHandler}
        placeholder="Content goes here..."
      />
    </div>
  );
}

export default Room;
