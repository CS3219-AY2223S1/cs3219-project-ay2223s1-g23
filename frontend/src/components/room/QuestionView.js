import { Typography, Box, Grid, Paper } from "@mui/material";

const bodyStyle = {
  overflow: "auto",
};

function QuestionView({ title, questionBody, difficulty }) {
  return (
    <Box>
      <Box display={"flex"} flexDirection={"row"} mt={"1rem"} mb={"1rem"}>
        <Grid container>
          <Grid item xs={10}>
            <Typography variant={"h5"}>{title}</Typography>
          </Grid>
          <Grid item xs={2} display="flex" justifyContent="flex-end">
            <Paper varient={6} sx={bodyStyle}>
              <Typography variant={"h5"} m={"5px"}>
                {difficulty ?? "unknown diff"}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      <Paper variant="outlined" square sx={{ overflow: "auto" }}>
        <Typography m={"1rem"} sx={{ height: "40rem" }}>
          {questionBody}
        </Typography>
      </Paper>
    </Box>
  );
}

export default QuestionView;
