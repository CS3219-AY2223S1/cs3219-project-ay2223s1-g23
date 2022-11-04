import {
  IconButton,
  Paper,
  Box,
  Grid,
  Button,
  TextField,
  Typography,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { URL_HIST, URL_QUES } from "../../configs";
import { STATUS_CODE_OK, STATUS_CODE_BAD_REQUEST } from "../../constants";
import axios from "axios";
import io from "socket.io-client";
import decodedJwt from "../../util/decodeJwt";
import QuestionView from "./QuestionView";

function HistoryPage() {
  const { histId } = useParams();
  const navigate = useNavigate();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [answerRecord, setAnsweRecord] = useState("Content goes here...");
  const [question, setQuestion] = useState({
    id: "id",
    title: "title",
    body: "body",
    difficulty: "difficulty",
    url: "url",
  });

  useEffect(() => {
    getHistory(histId);
  }, []);

  const getHistory = async (histId) => {
    const res = await axios
      .get(`${URL_HIST}/id`, {
        params: {
          id: histId,
        },
      })
      .catch((err) => {
        setAlertMsg(err.response.data.message);
        setIsAlertOpen(true);
      });
    if (res && res.status === STATUS_CODE_OK) {
      setAnsweRecord(res.data.data.answer);
      getQuestion(res.data.data.quesId);
    }
  };

  const getQuestion = async (quesId) => {
    const res = await axios
      .get(`${URL_QUES}/id`, {
        params: {
          id: quesId,
        },
      })
      .catch((err) => {
        if (err.response.status === STATUS_CODE_BAD_REQUEST) {
          console.log("ERROR: " + err.response.data.message);
          setAlertMsg(err.response.data.message);
          setIsAlertOpen(true);
        } else {
          console.log("Please try again later");
          setAlertMsg("Please try again later");
          setIsAlertOpen(true);
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

  const closeAlert = () => setIsAlertOpen(false);

  const errorAlert = () => {
    return (
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={isAlertOpen}
        autoHideDuration={4000}
        onClose={closeAlert}>
        <Alert severity="error" onClose={closeAlert}>
          {alertMsg}
        </Alert>
      </Snackbar>
    );
  };

  const handleLeaveRoom = async () => {
    navigate(`/`);
  };

  return (
    <Box>
      <Grid container>
        <Grid item xs={6}>
          <Box mr={"1rem"}>
            <Typography variant={"h4"}>History</Typography>
            <Divider variant="middle" />
            <QuestionView
              title={question.title}
              questionBody={question.body}
              difficulty={question.difficulty}
            />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box display={"flex"} flexDirection={"column"} pt={8}>
            <Paper variant="outlined" sx={{ padding: 1, height: "42rem", overflow: "auto" }}>
              <Typography sx={{ whiteSpace: "pre-line" }}>{answerRecord}</Typography>
            </Paper>
            <Box display={"flex"} flexDirection={"row"} justifyContent="flex-end">
              <Button variant="outlined" onClick={handleLeaveRoom} color="error" sx={{ margin: 1 }}>
                Return Homepage
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
      {errorAlert()}
    </Box>
  );
}

export default HistoryPage;
