import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Grid,
  Paper,
  Container,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { URL_USER_SVC_FORGET_PASSWORD } from "../../configs";
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_OK } from "../../constants";
import { Link } from "react-router-dom";

function ResetPasswordPage() {
  const [username, setUsername] = useState("");
  const [isUserErr, setIsUserErr] = useState(false);
  const [userErr, setUserErr] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleResetPassword = async () => {
    const res = await axios.post(URL_USER_SVC_FORGET_PASSWORD, { username }).catch((err) => {
      if (err.response.status === STATUS_CODE_BAD_REQUEST) {
        setIsUserErr(true);
        setUserErr(err.response.data.message);
      } else {
        setIsAlertOpen(true);
      }
    });
    if (res && res.status === STATUS_CODE_OK) {
      setIsDialogOpen(true);
    }
  };

  const closeAlert = () => setIsAlertOpen(false);

  const resetResult = () => {
    return (
      <Box>
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={isAlertOpen}
          autoHideDuration={4000}
          onClose={closeAlert}>
          <Alert severity="error" onClose={closeAlert}>
            Please try again later
          </Alert>
        </Snackbar>
        <Dialog open={isDialogOpen}>
          <DialogTitle>Success</DialogTitle>
          <DialogContent>
            <DialogContentText>Password reset link has been sent to your email</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button component={Link} to="/login" variant={"contained"} color={"secondary"}>
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  return (
    <Grid container>
      <Grid item xs={2} />
      <Grid item xs={8}>
        <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
          <Typography variant={"h3"} m={"1rem"}>
            Reset Password
          </Typography>
        </Box>
        <Paper elevation={3} sx={{ width: "65%", margin: "auto" }}>
          <Container fixed>
            <Table aria-label="simple table" sx={{ "& td": { border: 0 } }}>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ pl: "10rem" }}>
                    <Typography variant={"body1"}>Username</Typography>
                  </TableCell>
                  <TableCell sx={{ width: "50%" }}>
                    <TextField
                      variant="filled"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      error={isUserErr}
                      helperText={userErr}
                      sx={{ margin: "1rem" }}
                      autoFocus
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Container>
        </Paper>
        <Box
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          justifyContent={"center"}>
          <Button variant={"contained"} onClick={handleResetPassword} sx={{ margin: "2rem" }}>
            Reset
          </Button>
        </Box>
        {resetResult()}
      </Grid>
      <Grid item xs={2} />
    </Grid>
  );
}

export default ResetPasswordPage;
