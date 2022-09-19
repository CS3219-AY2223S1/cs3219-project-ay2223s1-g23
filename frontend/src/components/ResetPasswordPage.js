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
} from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { URL_USER_SVC } from "../configs";
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_CREATED } from "../constants";
import { Link } from "react-router-dom";

function ResetPasswordPage() {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMsg, setDialogMsg] = useState("");

  const handleResetPassword = async () => {
    const res = await axios
      .post(URL_USER_SVC, { username, newPassword, confirmNewPassword })
      .catch((err) => {
        if (err.response.status === STATUS_CODE_BAD_REQUEST) {
          setErrorDialog("ERROR: " + err.response.data.message);
        } else {
          setErrorDialog("Please try again later");
        }
      });
    if (res && res.status === STATUS_CODE_CREATED) {
      setSuccessDialog("Password Reset successfully");
    }
  };

  const closeDialog = () => setIsDialogOpen(false);

  const setSuccessDialog = (msg) => {
    setIsDialogOpen(true);
    setDialogTitle("Success");
    setDialogMsg(msg);
  };

  const setErrorDialog = (msg) => {
    setIsDialogOpen(true);
    setDialogTitle("Error");
    setDialogMsg(msg);
  };

  return (
    <Grid container>
      <Grid item xs={1} />
      <Grid item xs={10}>
        <Paper elevation={3}>
          <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
            <Typography variant={"h3"} ma={"2rem"}>
              Reset Password
            </Typography>
          </Box>
          <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}>
            <TextField
              label="Username"
              variant="filled"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ marginBottom: "1rem" }}
              autoFocus
            />
            <TextField
              label="New Password"
              variant="filled"
              type="email"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ marginBottom: "2rem" }}
            />
            <TextField
              label="Confirm New Password"
              variant="filled"
              type="confirm password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              sx={{ marginBottom: "2rem" }}
            />
          </Box>
          <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}>
            <Button variant={"contained"} onClick={handleResetPassword}>
              Reset
            </Button>
          </Box>
          <Dialog open={isDialogOpen} onClose={closeDialog}>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
              <DialogContentText>{dialogMsg}</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button component={Link} to="/login">
                Done
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Grid>
      <Grid item xs={1} />
    </Grid>
  );
}

export default ResetPasswordPage;
