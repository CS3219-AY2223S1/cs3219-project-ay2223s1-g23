import { Typography, Box, Grid } from "@mui/material";
import { Link } from "react-router-dom";

const bodyStyle = {
  width: "50%",
  height: "5rem",
};

function HistoryCard({histId, title, body, difficulty}) {

  return (
    <Box sx={{width: "100%"}}>
      <Grid container>
        <Grid item xs={10}>
          <Typography component={Link} to={`history/${histId}`} variant={"h5"}>{title}</Typography>
          <Typography noWrap sx={bodyStyle}>{body}</Typography>
        </Grid>
        <Grid item xs={2} display="flex" justifyContent="flex-end">
          <Paper varient={6}>
            <Typography variant={"h5"} m={"5px"}>
              {difficulty ?? "unknown diff"}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HistoryCard;
  