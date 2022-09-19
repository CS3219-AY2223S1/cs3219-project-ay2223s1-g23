import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
  Grid,
  Paper,
} from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { URL_USER_SVC_LOGIN } from "../configs";
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_OK } from "../constants";
import { useDispatch } from "react-redux";
import { update } from "../modules/user/userSlice";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMsg, setDialogMsg] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await axios.post(URL_USER_SVC_LOGIN, { username, password }).catch((err) => {
      if (err.response.status === STATUS_CODE_BAD_REQUEST) {
        setErrorDialog("ERROR: " + err.response.data.message);
      } else {
        setErrorDialog("Please try again later");
      }
    });
    if (res && res.status === STATUS_CODE_OK) {
      const token = res.data.jwt;
      setSuccessDialog("Account successfully login with JWT:" + token);
      setCookie("token", token, 0.01);
      console.log(document.cookie);
      dispatch(
        update({
          userId: "",
          username: username,
        }),
      );
      navigate(`/diff`);
    }
  };

  function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

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
      <Grid item xs={7}>
        <Box flexDirection={"column"}>
          <Typography variant={"h4"} m={"2rem"}>
            About PeerPressure
          </Typography>
          <Typography variant={"body1"} m={"2rem"}>
            a web application
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={5}>
        <Paper elevation={3}>
          <Box display={"flex"}>
            <Typography variant={"h3"} ma={"2rem"}>
              Login
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
              label="Password"
              variant="filled"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ marginBottom: "2rem" }}
            />
          </Box>
          <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}>
            <Button variant={"contained"} onClick={handleLogin}>
              Log in
            </Button>
            <Box display={"flex"} alignItems={"center"} justifyContent={"center"} margin={"1rem"}>
              <Typography variant={"body1"}> Forgotten Password?</Typography>
              <Typography component={Link} to="/signup" variant={"body1"}>
                Reset it
              </Typography>
            </Box>
            <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
              <Typography variant={"body1"} marginBottom={"2rem"}>
                Don&apos;t have an account?
              </Typography>
              <Typography component={Link} to="/signup" variant={"body1"} marginBottom={"2rem"}>
                Click here
              </Typography>
            </Box>
          </Box>
          <Dialog open={isDialogOpen} onClose={closeDialog}>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
              <DialogContentText>{dialogMsg}</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDialog}>Done</Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default LoginPage;
