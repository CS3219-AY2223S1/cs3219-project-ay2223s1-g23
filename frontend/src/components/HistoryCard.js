import { Typography, Box, Grid, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import { URL_QUES } from "../configs";
import { STATUS_CODE_OK, STATUS_CODE_BAD_REQUEST } from "../constants";
import axios from "axios";
import { Link } from "react-router-dom";

const bodyStyle = {
  width: "50%",
  height: "5rem",
};

function HistoryCard({ histId, questionId }) {
  const [question, setQuestion] = useState({
    id: "id",
    title: "title",
    body: "body",
    difficulty: "difficulty",
    url: "url",
  });

  useEffect(() => {
    fetchQuesDetails(questionId);
  }, []);

  const fetchQuesDetails = async (quesId) => {
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

    if (!res || res.status != STATUS_CODE_OK) return;
    const { _id, title, body, difficulty, url } = res.data.data;
    setQuestion({
      id: _id,
      title: title,
      body: body,
      difficulty: difficulty,
      url: url,
    });
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Grid container>
        <Grid item xs={10}>
          <Typography component={Link} to={`diff/history/${histId}`} variant={"h5"}>
            {question.title}
          </Typography>
          <Typography noWrap sx={bodyStyle}>
            {question.body}
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
  );
}

export default HistoryCard;
